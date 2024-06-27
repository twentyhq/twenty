import { Injectable } from '@nestjs/common';

import { RunnableSequence } from '@langchain/core/runnables';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { isUUID } from 'class-validator';
import { DataSource, QueryFailedError } from 'typeorm';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import groupBy from 'lodash.groupby';

import { AskAIQueryResult } from 'src/engine/core-modules/ask-ai/dtos/ask-ai-query-result.dto';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { WorkspaceQueryRunnerService } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.service';
import { LLMChatModelService } from 'src/engine/integrations/llm-chat-model/llm-chat-model.service';
import { LLMTracingService } from 'src/engine/integrations/llm-tracing/llm-tracing.service';
import { sqlGenerationPromptTemplate } from 'src/engine/core-modules/ask-ai/ask-ai.prompt-templates';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { DEFAULT_LABEL_IDENTIFIER_FIELD_NAME } from 'src/engine/metadata-modules/object-metadata/object-metadata.constants';
import { compositeTypeDefintions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';

@Injectable()
export class AskAIService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly workspaceQueryRunnerService: WorkspaceQueryRunnerService,
    private readonly llmChatModelService: LLMChatModelService,
    private readonly llmTracingService: LLMTracingService,
    private readonly objectMetadataService: ObjectMetadataService,
  ) {}

  private getLabelIdentifierSelectionSet(
    objectMetadata: ObjectMetadataEntity,
  ): string | undefined {
    const labelIdentifierFieldMetadata = objectMetadata.fields.find(
      (fieldMetadata) =>
        fieldMetadata.id === objectMetadata.labelIdentifierFieldMetadataId,
    );

    // TOOD

    /* const standardObjectMetadataCollection = this.standardObjectFactory.create(
      standardObjectMetadataDefinitions,
      context,
      workspaceFeatureFlagsMap,
    ); */

    // const standardObjectMetadata = computeStandardObject()

    /*     console.log(
      'getLabelIdentifierSelectionSet',
      objectMetadata.namePlural,
      labelIdentifierFieldMetadata?.type,
    ); */

    if (!labelIdentifierFieldMetadata)
      return DEFAULT_LABEL_IDENTIFIER_FIELD_NAME;

    if (isCompositeFieldMetadataType(labelIdentifierFieldMetadata.type)) {
      return `${labelIdentifierFieldMetadata.name} {
        ${compositeTypeDefintions
          .get(labelIdentifierFieldMetadata.type)
          ?.properties.map((property) => property.name)
          .join('\n')}
      }`;
    }

    return labelIdentifierFieldMetadata.name;
  }

  private async getEntitiesById(
    workspaceId: string,
    objectMetadataEntities: ObjectMetadataEntity[],
    sqlQueryResult: Record<string, any>[],
  ): Promise<any> {
    const uuids = sqlQueryResult
      .flatMap((row) => Object.values(row))
      .filter((value) => isUUID(value, 4));

    const query = `query {
      ${objectMetadataEntities
        .map(
          (objectMetadata) => `${
            objectMetadata.namePlural
          }(filter: {id: {in: [${uuids
            .map((uuid) => `"${uuid}"`)
            .join(', ')}]}}) {
      edges {
        node {
          id
          ${this.getLabelIdentifierSelectionSet(objectMetadata)}
        }
      }
    }`,
        )
        .join('\n')}}`;

    // this.workspaceQueryRunnerService.executeAndParse?
    const records = await this.workspaceQueryRunnerService.execute(
      query,
      workspaceId,
    );

    return {} as any;
  }

  private async getColInfosByTableName(dataSource: DataSource) {
    const { schema } = dataSource.options as PostgresConnectionOptions;

    // From LangChain sql_utils.ts - TODO: Move elsewhere or replace with a query to fieldMetadata?
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
    // TODO:
    // 1. Get all fieldMetadata related to object as an argument (to avoid per-table queries)
    // 2. Get all relationMetadata related to fields as an argument (call findManyRelationMetadataByFieldMetadataIds outside this function?)
    // 3. Construct sentences like the following:
    // investorId: a foreign key referencing the person table, indicating the investor who owns this portfolio company.
    return '';
  }

  private getTableDescription(tableName: string, colInfos: any[]) {
    return [
      this.getCreateTableStatement(tableName, colInfos),
      // this.getRelationDescriptions(),
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

  async query(
    userId: string,
    userEmail: string,
    workspaceId: string,
    userQuestion: string,
  ): Promise<AskAIQueryResult> {
    const workspaceSchemaName =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    workspaceDataSource.setOptions({ schema: workspaceSchemaName });

    const objectMetadataEntities =
      await this.objectMetadataService.findManyWithinWorkspace(workspaceId, {
        where: { isSystem: false, isActive: true },
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
      userId,
      userEmail,
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

    try {
      const sqlQueryResult: Record<string, any>[] =
        await this.workspaceQueryRunnerService.executeSQL(
          workspaceDataSource,
          workspaceId,
          sqlQuery,
        ); // TODO: Add return type to executeSQL function?

      const recordDisplayDataById = await this.getEntitiesById(
        workspaceId,
        objectMetadataEntities,
        sqlQueryResult,
      );

      return {
        sqlQuery,
        sqlQueryResult: JSON.stringify(sqlQueryResult),
        recordDisplayDataById,
      };
    } catch (error) {
      if (error instanceof QueryFailedError) {
        return {
          sqlQuery,
          queryFailedErrorMessage: error.message,
        };
      }

      // TODO: logger.log error
      return {
        sqlQuery,
      };
    }
  }
}
