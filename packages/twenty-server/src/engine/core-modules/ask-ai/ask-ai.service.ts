import { Injectable } from '@nestjs/common';

import { SqlDatabase } from 'langchain/sql_db';
import { RunnableSequence } from '@langchain/core/runnables';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { isUUID } from 'class-validator';
import { DataSource } from 'typeorm';
import omit from 'lodash.omit';
import { z } from 'zod';

import { LLMPromptTemplateEnvVar } from 'src/engine/integrations/llm-prompt-template/interfaces/llm-prompt-template-name.interface';

import {
  AskAIQueryResult,
  RecordMetadataById,
} from 'src/engine/core-modules/ask-ai/dtos/ask-ai-query-result.dto';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { WorkspaceQueryRunnerService } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.service';
import { LLMPromptTemplateService } from 'src/engine/integrations/llm-prompt-template/llm-prompt-template.service';
import { LLMChatModelService } from 'src/engine/integrations/llm-chat-model/llm-chat-model.service';
import { LLMTracingService } from 'src/engine/integrations/llm-tracing/llm-tracing.service';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';

@Injectable()
export class AskAIService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly workspaceQueryRunnerService: WorkspaceQueryRunnerService,
    private readonly llmChatModelService: LLMChatModelService,
    private readonly llmPromptTemplateService: LLMPromptTemplateService,
    private readonly llmTracingService: LLMTracingService,
    private readonly objectMetadataService: ObjectMetadataService,
  ) {}

  private async getRecordMetadataById(
    workspaceId: string,
    workspaceDataSource: DataSource,
    sqlQueryResult: Record<string, any>[],
  ) {
    const uuids = sqlQueryResult
      .flatMap((row) => Object.values(row))
      .filter((value) => isUUID(value, 4));

    const objectMetadataEntities =
      await this.objectMetadataService.findManyWithinWorkspace(workspaceId, {
        where: { isSystem: false, isActive: true },
      });

    const columnNamesByStandardObjectName = {
      opportunity: ['id', 'name'],
      company: ['id', 'name', 'domainName'],
      person: ['id', 'nameFirstName', 'nameLastName'],
    };

    const customObjectColumnNames = ['id', 'name'];

    let recordMetadataById: RecordMetadataById = {};

    for (const { nameSingular, isCustom } of objectMetadataEntities) {
      const tableName = computeTableName(nameSingular, isCustom);

      const columnNames = isCustom
        ? customObjectColumnNames
        : columnNamesByStandardObjectName[nameSingular];

      const columnNamesString =
        columnNames.map((col) => `"${col}"`).join(', ') || '';

      // Security? GraphQL?
      const recordMetadataSqlQuery = `SELECT ${columnNamesString} FROM "${tableName}" WHERE "id" = ANY($1);`;

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

      recordMetadataById = result.reduce((recordMetadataById, row) => {
        return {
          ...recordMetadataById,
          [row.id]: {
            objectNameSingular: nameSingular,
            ...omit(row, 'id'),
          },
        };
      }, recordMetadataById);
    }

    return recordMetadataById;
  }

  async query(
    userId: string,
    userEmail: string,
    workspaceId: string,
    text: string,
  ): Promise<AskAIQueryResult> {
    const workspaceSchemaName =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    workspaceDataSource.setOptions({ schema: workspaceSchemaName });

    const db = await SqlDatabase.fromDataSourceParams({
      appDataSource: workspaceDataSource,
      sampleRowsInTableInfo: 0,
    });

    const promptTemplate =
      await this.llmPromptTemplateService.getPromptTemplate(
        LLMPromptTemplateEnvVar.AskAI,
      );

    const structuredOutputParser = StructuredOutputParser.fromZodSchema(
      z.object({
        sqlQuery: z.string(),
      }),
    );

    const sqlQueryGeneratorChain = RunnableSequence.from([
      promptTemplate,
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
        schema: await db.getTableInfo(),
        question: text,
      },
      {
        callbacks: [tracingCallbackHandler],
      },
    );

    try {
      const sqlQueryResult = (await this.workspaceQueryRunnerService.executeSQL(
        workspaceDataSource,
        workspaceId,
        sqlQuery,
      )) as Record<string, any>[]; // TODO: Add return type to executeSQL function?

      const recordMetadataById = await this.getRecordMetadataById(
        workspaceId,
        workspaceDataSource,
        sqlQueryResult,
      );

      return {
        sqlQuery,
        sqlQueryResult: JSON.stringify(sqlQueryResult),
        recordMetadataById,
      };
    } catch (e) {
      return {
        sqlQuery,
      };
    }
  }
}
