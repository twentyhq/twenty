import { Injectable, Logger } from '@nestjs/common';

import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import groupBy from 'lodash.groupby';
import { DataSource, QueryFailedError } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import { WorkspaceQueryRunnerService } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.service';
import { sqlGenerationPromptTemplate } from 'src/engine/core-modules/ai-sql-query/ai-sql-query.prompt-templates';
import { AISQLQueryResult } from 'src/engine/core-modules/ai-sql-query/dtos/ai-sql-query-result.dto';
import { LLMChatModelService } from 'src/engine/integrations/llm-chat-model/llm-chat-model.service';
import { LLMTracingService } from 'src/engine/integrations/llm-tracing/llm-tracing.service';
import { DEFAULT_LABEL_IDENTIFIER_FIELD_NAME } from 'src/engine/metadata-modules/object-metadata/object-metadata.constants';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { StandardObjectFactory } from 'src/engine/workspace-manager/workspace-sync-metadata/factories/standard-object.factory';

@Injectable()
export class AISQLQueryService {
  private readonly logger = new Logger(AISQLQueryService.name);
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly workspaceQueryRunnerService: WorkspaceQueryRunnerService,
    private readonly llmChatModelService: LLMChatModelService,
    private readonly llmTracingService: LLMTracingService,
    private readonly standardObjectFactory: StandardObjectFactory,
  ) {}

  private getLabelIdentifierName(
    objectMetadata: ObjectMetadataEntity,
    _dataSourceId,
    _workspaceId,
    _workspaceFeatureFlagsMap,
  ): string | undefined {
    const customObjectLabelIdentifierFieldMetadata = objectMetadata.fields.find(
      (fieldMetadata) =>
        fieldMetadata.id === objectMetadata.labelIdentifierFieldMetadataId,
    );

    /* const standardObjectMetadataCollection = this.standardObjectFactory.create(
      standardObjectMetadataDefinitions,
      { workspaceId, dataSourceId },
      workspaceFeatureFlagsMap,
    );

    const standardObjectLabelIdentifierFieldMetadata =
      standardObjectMetadataCollection
        .find(
          (standardObjectMetadata) =>
            standardObjectMetadata.nameSingular === objectMetadata.nameSingular,
        )
        ?.fields.find(
          (field: PartialFieldMetadata) =>
            field.name === DEFAULT_LABEL_IDENTIFIER_FIELD_NAME,
        ) as PartialFieldMetadata; */

    const labelIdentifierFieldMetadata =
      customObjectLabelIdentifierFieldMetadata; /*??
      standardObjectLabelIdentifierFieldMetadata*/

    return (
      labelIdentifierFieldMetadata?.name ?? DEFAULT_LABEL_IDENTIFIER_FIELD_NAME
    );
  }

  private async getColInfosByTableName(dataSource: DataSource) {
    const { schema } = dataSource.options as PostgresConnectionOptions;

    // From LangChain sql_utils.ts
    const sqlQuery = `SELECT 
              t.table_name, 
              c.* 
            FROM 
              information_schema.tables t 
                JOIN information_schema.columns c 
                  ON t.table_name = c.table_name 
            WHERE 
              t.table_schema = '${schema}' 
                AND c.table_schema = '${schema}' 
            ORDER BY 
              t.table_name,
              c.ordinal_position;`;
    const colInfos = await dataSource.query<
      {
        table_name: string;
        column_name: string;
        data_type: string | undefined;
        is_nullable: 'YES' | 'NO';
      }[]
    >(sqlQuery);

    return groupBy(colInfos, (colInfo) => colInfo.table_name);
  }

  private getCreateTableStatement(tableName: string, colInfos: any[]) {
    return `${`CREATE TABLE ${tableName} (\n`} ${colInfos
      .map(
        (colInfo) =>
          `${colInfo.column_name} ${colInfo.data_type} ${
            colInfo.is_nullable === 'YES' ? '' : 'NOT NULL'
          }`,
      )
      .join(', ')});`;
  }

  private getRelationDescriptions() {
    // TODO - Construct sentences like the following:
    // investorId: a foreign key referencing the person table, indicating the investor who owns this portfolio company.
    return '';
  }

  private getTableDescription(tableName: string, colInfos: any[]) {
    return [
      this.getCreateTableStatement(tableName, colInfos),
      this.getRelationDescriptions(),
    ].join('\n');
  }

  private async getWorkspaceSchemaDescription(
    dataSource: DataSource,
  ): Promise<string> {
    const colInfoByTableName = await this.getColInfosByTableName(dataSource);

    return Object.entries(colInfoByTableName)
      .map(([tableName, colInfos]) =>
        this.getTableDescription(tableName, colInfos),
      )
      .join('\n\n');
  }

  private async generateWithDataSource(
    workspaceId: string,
    workspaceDataSource: DataSource,
    userQuestion: string,
    traceMetadata: Record<string, string> = {},
  ) {
    const workspaceSchemaName =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    workspaceDataSource.setOptions({
      schema: workspaceSchemaName,
    });

    const workspaceSchemaDescription =
      await this.getWorkspaceSchemaDescription(workspaceDataSource);

    const llmOutputSchema = z.object({
      sqlQuery: z.string(),
    });

    const llmOutputJsonSchema = JSON.stringify(
      zodToJsonSchema(llmOutputSchema),
    );

    const structuredOutputParser =
      StructuredOutputParser.fromZodSchema(llmOutputSchema);

    const sqlQueryGeneratorChain = RunnableSequence.from([
      sqlGenerationPromptTemplate,
      this.llmChatModelService.getJSONChatModel(),
      structuredOutputParser,
    ]);

    const metadata = {
      workspaceId,
      ...traceMetadata,
    };
    const tracingCallbackHandler =
      this.llmTracingService.getCallbackHandler(metadata);

    const { sqlQuery } = await sqlQueryGeneratorChain.invoke(
      {
        llmOutputJsonSchema,
        sqlCreateTableStatements: workspaceSchemaDescription,
        userQuestion,
      },
      {
        callbacks: [tracingCallbackHandler],
      },
    );

    return sqlQuery;
  }

  async generate(
    workspaceId: string,
    userQuestion: string,
    traceMetadata: Record<string, string> = {},
  ) {
    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    return this.generateWithDataSource(
      workspaceId,
      workspaceDataSource,
      userQuestion,
      traceMetadata,
    );
  }

  async generateAndExecute(
    workspaceId: string,
    userQuestion: string,
    traceMetadata: Record<string, string> = {},
  ): Promise<AISQLQueryResult> {
    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    const sqlQuery = await this.generateWithDataSource(
      workspaceId,
      workspaceDataSource,
      userQuestion,
      traceMetadata,
    );

    try {
      const sqlQueryResult: Record<string, any>[] =
        await this.workspaceQueryRunnerService.executeSQL(
          workspaceDataSource,
          workspaceId,
          sqlQuery,
        );

      return {
        sqlQuery,
        sqlQueryResult: JSON.stringify(sqlQueryResult),
      };
    } catch (error) {
      if (error instanceof QueryFailedError) {
        return {
          sqlQuery,
          queryFailedErrorMessage: error.message,
        };
      }

      this.logger.error(error.message, error.stack);

      return {
        sqlQuery,
      };
    }
  }
}
