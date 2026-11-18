import { Injectable, Logger } from '@nestjs/common';

import { createHash } from 'crypto';

import { type DocumentNode, type GraphQLSchema, validate } from 'graphql';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { WorkspaceGraphqlSchemaSDLService } from 'src/engine/api/graphql/workspace-graphql-schema-sdl/workspace-graphql-schema-sdl.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';

const MAX_CACHED_DOCUMENTS_PER_SCHEMA = 500;
const MAX_LOGGED_ERRORS = 5;

@Injectable()
export class GraphqlDocumentValidationService {
  private readonly logger = new Logger(GraphqlDocumentValidationService.name);

  // Messages only: a GraphQLError keeps its whole document in memory
  private readonly validationErrorsByDocumentHashBySchema = new WeakMap<
    GraphQLSchema,
    Map<string, string[]>
  >();

  constructor(
    private readonly workspaceGraphqlSchemaSDLService: WorkspaceGraphqlSchemaSDLService,
    private readonly metricsService: MetricsService,
  ) {}

  async validateDocument({
    workspace,
    applicationId,
    document,
  }: {
    workspace: FlatWorkspace;
    applicationId?: string;
    document: DocumentNode;
  }): Promise<string[]> {
    const schema =
      await this.workspaceGraphqlSchemaSDLService.getOrComputeSchema({
        workspace,
        applicationId,
      });
    const query = document.loc?.source.body;

    if (!isDefined(schema) || !isDefined(query)) {
      return [];
    }

    const documentHash = createHash('sha256').update(query).digest('hex');
    const validationErrorsByDocumentHash =
      this.validationErrorsByDocumentHashBySchema.get(schema) ?? new Map();

    this.validationErrorsByDocumentHashBySchema.set(
      schema,
      validationErrorsByDocumentHash,
    );

    const cachedValidationErrors =
      validationErrorsByDocumentHash.get(documentHash);

    if (isDefined(cachedValidationErrors)) {
      return cachedValidationErrors;
    }

    const validationErrors = validate(schema, document).map(
      ({ message }) => message,
    );

    if (
      validationErrorsByDocumentHash.size >= MAX_CACHED_DOCUMENTS_PER_SCHEMA
    ) {
      validationErrorsByDocumentHash.clear();
    }

    validationErrorsByDocumentHash.set(documentHash, validationErrors);

    if (isNonEmptyArray(validationErrors)) {
      this.reportInvalidDocument({
        workspaceId: workspace.id,
        documentHash,
        validationErrors,
      });
    }

    return validationErrors;
  }

  // Not enforced yet: invalid documents still execute, this only measures what enforcing would reject
  private reportInvalidDocument({
    workspaceId,
    documentHash,
    validationErrors,
  }: {
    workspaceId: string;
    documentHash: string;
    validationErrors: string[];
  }): void {
    this.metricsService.incrementCounterBy({
      key: MetricsKeys.GraphqlDirectExecutionInvalidDocument,
      amount: 1,
    });

    this.logger.warn(
      `GraphQL document ${documentHash.slice(0, 16)} in workspace ${workspaceId} fails validation: ${validationErrors
        .slice(0, MAX_LOGGED_ERRORS)
        .join(' | ')}`,
    );
  }
}
