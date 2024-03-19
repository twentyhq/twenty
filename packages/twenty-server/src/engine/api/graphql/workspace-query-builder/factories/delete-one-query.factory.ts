import { Injectable, Logger } from '@nestjs/common';

import { WorkspaceQueryBuilderOptions } from 'src/engine/api/graphql/workspace-query-builder/interfaces/workspace-query-builder-options.interface';
import { DeleteOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';

import { FieldsStringFactory } from './fields-string.factory';

@Injectable()
export class DeleteOneQueryFactory {
  private readonly logger = new Logger(DeleteOneQueryFactory.name);

  constructor(private readonly fieldsStringFactory: FieldsStringFactory) {}

  async create(
    args: DeleteOneResolverArgs,
    options: WorkspaceQueryBuilderOptions,
  ) {
    const fieldsString = await this.fieldsStringFactory.create(
      options.info,
      options.fieldMetadataCollection,
      options.objectMetadataCollection,
    );

    return `
      mutation {
        deleteFrom${computeObjectTargetTable(
          options.objectMetadataItem,
        )}Collection(filter: { id: { eq: "${args.id}" } }) {
          affectedCount
          records {
            ${fieldsString}
          }
        }
      }
    `;
  }
}
