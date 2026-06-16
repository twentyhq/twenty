import { Injectable } from '@nestjs/common';

import { type AggregateOperations } from 'twenty-shared/types';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { CommonApiContextBuilderService } from 'src/engine/core-modules/record-crud/services/common-api-context-builder.service';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { GroupByRecordsService } from 'src/engine/core-modules/record-crud/services/group-by-records.service';
import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
import { type QueryAst } from 'src/engine/core-modules/record-crud/types/query-tool-ast.type';
import { type QueryRecordsParams } from 'src/engine/core-modules/record-crud/types/query-records-params.type';
import { compileQuery } from 'src/engine/core-modules/record-crud/utils/compile-query.util';
import {
  formatQueryCompileErrors,
  formatQueryInputIssues,
} from 'src/engine/core-modules/record-crud/utils/format-query-compile-errors.util';
import { QueryToolInputSchema } from 'src/engine/core-modules/record-crud/zod-schemas/query-tool.zod-schema';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

// Backs the single `query` AI tool. Validates and lowers the AST, then reuses
// the existing find / group-by services so permissions, pagination and field
// selection are inherited rather than reimplemented.
@Injectable()
export class QueryRecordsService {
  constructor(
    private readonly commonApiContextBuilder: CommonApiContextBuilderService,
    private readonly findRecordsService: FindRecordsService,
    private readonly groupByRecordsService: GroupByRecordsService,
  ) {}

  async execute(params: QueryRecordsParams): Promise<ToolOutput> {
    const { input, authContext, rolePermissionConfig } = params;

    const parsedInput = QueryToolInputSchema.safeParse(input);

    if (!parsedInput.success) {
      return {
        success: false,
        message: 'Invalid query',
        error: `The query did not match the expected shape:\n${formatQueryInputIssues(parsedInput.error)}`,
      };
    }

    const ast = parsedInput.data as QueryAst;

    let objectMetadata: ObjectMetadataForToolSchema;

    try {
      const { flatObjectMetadata, flatFieldMetadataMaps } =
        await this.commonApiContextBuilder.build({
          authContext,
          objectName: ast.from,
        });

      objectMetadata = {
        ...flatObjectMetadata,
        fields: getFlatFieldsFromFlatObjectMetadata(
          flatObjectMetadata,
          flatFieldMetadataMaps,
        ),
      };
    } catch (error) {
      return {
        success: false,
        message: `Cannot query "${ast.from}"`,
        error:
          error instanceof Error
            ? error.message
            : `Unknown object "${ast.from}"`,
      };
    }

    const compiled = compileQuery(ast, objectMetadata);

    if (!compiled.ok) {
      return {
        success: false,
        message: `Query is invalid for ${ast.from}`,
        error: `The query referenced fields or operators that are not valid:\n${formatQueryCompileErrors(compiled.errors)}`,
      };
    }

    if (compiled.query.kind === 'aggregate') {
      return this.groupByRecordsService.execute({
        objectName: ast.from,
        groupBy: compiled.query.groupBy,
        aggregateOperation: compiled.query
          .operation as keyof typeof AggregateOperations,
        aggregateFieldName: compiled.query.field,
        limit: compiled.query.limit,
        orderBy: 'DESC',
        filter: compiled.query.filter as Record<string, unknown>,
        authContext,
        rolePermissionConfig,
      });
    }

    return this.findRecordsService.execute({
      objectName: ast.from,
      filter: compiled.query.filter,
      orderBy: compiled.query.orderBy,
      limit: compiled.query.limit,
      offset: compiled.query.offset,
      select: compiled.query.select,
      shouldBuildEffectiveSelectFields: true,
      authContext,
      rolePermissionConfig,
    });
  }
}
