import { Injectable } from '@nestjs/common';

import { RunnableSequence } from '@langchain/core/runnables';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { isUUID } from 'class-validator';
import { DataSource, QueryFailedError } from 'typeorm';
import omit from 'lodash.omit';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import groupBy from 'lodash.groupby';

import {
  AskAIQueryResult,
  RecordDisplayDataById,
} from 'src/engine/core-modules/ask-ai/dtos/ask-ai-query-result.dto';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { WorkspaceQueryRunnerService } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.service';
import { LLMChatModelService } from 'src/engine/integrations/llm-chat-model/llm-chat-model.service';
import { LLMTracingService } from 'src/engine/integrations/llm-tracing/llm-tracing.service';
import { sqlGenerationPromptTemplate } from 'src/engine/core-modules/ask-ai/ask-ai.prompt-templates';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';
import {
  DEFAULT_LABEL_IDENTIFIER_FIELD_NAME,
  IMAGE_IDENTIFIER_FIELD_NAMES_BY_STANDARD_OBJECT_NAME,
  SPECIAL_LABEL_IDENTIFIER_FIELD_NAMES_BY_STANDARD_OBJECT_NAME,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.constants';

@Injectable()
export class AskAIService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly workspaceQueryRunnerService: WorkspaceQueryRunnerService,
    private readonly llmChatModelService: LLMChatModelService,
    private readonly llmTracingService: LLMTracingService,
    private readonly objectMetadataService: ObjectMetadataService,
  ) {}

  /**
   * Get labelIdentifier field names and imageIdentifier field names by objectNameSingular
   */
  async getIdentifierFieldNamesByObjectName(
    objectMetadataEntities: ObjectMetadataEntity[],
  ): Promise<Record<string, string[]>> {
    const labelIdentifierFieldMetadataEntities = objectMetadataEntities.flatMap(
      (objectMetadataEntity) =>
        objectMetadataEntity.fields.filter(
          (fieldMetadataEntity) =>
            fieldMetadataEntity.id ===
            objectMetadataEntity.labelIdentifierFieldMetadataId,
        ),
    );

    const defaultLabelIdentifierFieldNamesByObjectName: Record<
      string,
      string[]
    > = objectMetadataEntities.reduce(
      (defaultLabelIdentifierFieldNamesByObjectName, objectMetadataEntity) => {
        const imageIdentifierFieldNames =
          IMAGE_IDENTIFIER_FIELD_NAMES_BY_STANDARD_OBJECT_NAME[
            objectMetadataEntity.nameSingular
          ] ?? [];
        const defaultLabelIdentifierFieldNames = [
          DEFAULT_LABEL_IDENTIFIER_FIELD_NAME,
          ...imageIdentifierFieldNames,
        ];

        return {
          ...defaultLabelIdentifierFieldNamesByObjectName,
          [objectMetadataEntity.nameSingular]: defaultLabelIdentifierFieldNames,
        };
      },
      {},
    );

    const labelIdentifierFieldNamesByObjectName: Record<string, string[]> =
      labelIdentifierFieldMetadataEntities.reduce(
        (
          labelIdentifierFieldNamesByObjectName,
          labelIdentifierFieldMetadataEntity,
        ) => {
          return {
            ...labelIdentifierFieldNamesByObjectName,
            [labelIdentifierFieldMetadataEntity.object.nameSingular]: [
              labelIdentifierFieldMetadataEntity.name,
            ],
          };
        },
        {},
      );

    return {
      ...defaultLabelIdentifierFieldNamesByObjectName,
      ...labelIdentifierFieldNamesByObjectName,
      ...SPECIAL_LABEL_IDENTIFIER_FIELD_NAMES_BY_STANDARD_OBJECT_NAME,
    };
  }

  private async getRecordDisplayDataById(
    workspaceId: string,
    workspaceDataSource: DataSource,
    sqlQueryResult: Record<string, any>[],
  ) {
    const uuids = sqlQueryResult
      .flatMap((row) => Object.values(row))
      .filter((value) => isUUID(value, 4));

    let recordDisplayDataById: RecordDisplayDataById = {};

    const objectMetadataEntities =
      await this.objectMetadataService.findManyWithinWorkspace(workspaceId, {
        where: { isSystem: false, isActive: true },
      });

    const isCustomByObjectName = await objectMetadataEntities.reduce(
      (isCustomByObjectName, objectMetadataEntity) => ({
        ...isCustomByObjectName,
        [objectMetadataEntity.nameSingular]: objectMetadataEntity.isCustom,
      }),
      {} as Record<string, boolean>,
    );

    const identifierFieldNamesByObjectName =
      await this.getIdentifierFieldNamesByObjectName(objectMetadataEntities);

    for (const [objectName, identifierFieldNames] of Object.entries(
      identifierFieldNamesByObjectName,
    )) {
      const isCustom = isCustomByObjectName[objectName];
      const tableName = computeTableName(objectName, isCustom);

      const identifierFieldNamesString =
        identifierFieldNames
          .map((identifierFieldName) => `"${identifierFieldName}"`)
          .join(', ') || '';

      // Security? GraphQL?
      const recordMetadataSqlQuery = `SELECT id, ${identifierFieldNamesString} FROM "${tableName}" WHERE "id" = ANY($1);`;

      const result: {
        id: string;
        name: string;
        domainName?: string;
        nameFirstName?: string;
        nameLastName?: string;
      }[] = await this.workspaceQueryRunnerService.executeSQL(
        workspaceDataSource,
        workspaceId,
        recordMetadataSqlQuery,
        [uuids],
      );

      recordDisplayDataById = result.reduce((recordDisplayDataById, row) => {
        return {
          ...recordDisplayDataById,
          [row.id]: {
            objectNameSingular: objectName,
            ...omit(row, 'id'),
          },
        };
      }, recordDisplayDataById);
    }

    return recordDisplayDataById;
  }

  async getColInfosByTableName(dataSource: DataSource) {
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

  async getSQLCreateTableStatements(dataSource: DataSource): Promise<string> {
    const colInfoByTableName = await this.getColInfosByTableName(dataSource);

    return Object.entries(colInfoByTableName)
      .map(
        ([tableName, colInfos]) =>
          `${`CREATE TABLE ${tableName} (\n`} ${colInfos
            .map(
              (colInfo) =>
                `${colInfo.column_name} ${colInfo.data_type} ${
                  colInfo.is_nullable === 'YES' ? '' : 'NOT NULL'
                }`,
            )
            .join(', ')});`,
      )
      .join('\n');
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

    const sqlCreateTableStatements =
      await this.getSQLCreateTableStatements(workspaceDataSource);

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
        sqlCreateTableStatements,
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

      const recordDisplayDataById = await this.getRecordDisplayDataById(
        workspaceId,
        workspaceDataSource,
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
