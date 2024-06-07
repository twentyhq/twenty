import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ChatOpenAI } from '@langchain/openai';
import { SqlDatabase } from 'langchain/sql_db';
import { PromptTemplate } from '@langchain/core/prompts';
import {
  RunnablePassthrough,
  RunnableSequence,
} from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { Repository } from 'typeorm';

import { TextToSQLQueryResult } from 'src/engine/core-modules/text-to-sql/dtos/text-to-sql-query-result.dto';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import {
  FeatureFlagEntity,
  FeatureFlagKeys,
} from 'src/engine/core-modules/feature-flag/feature-flag.entity';

@Injectable()
export class TextToSQLService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {}

  async query(
    workspaceId: string,
    text: string,
  ): Promise<TextToSQLQueryResult> {
    const isAskAIEnabledFeatureFlag =
      await this.featureFlagRepository.findOneBy({
        workspaceId,
        key: FeatureFlagKeys.IsAskAIEnabled,
        value: true,
      });

    if (!isAskAIEnabledFeatureFlag?.value) {
      throw new ForbiddenException(
        `${FeatureFlagKeys.IsAskAIEnabled} feature flag is disabled`,
      );
    }

    const workspaceSchemaName =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    // Does this have unintended side effects? It sets the schema of LangChain's SqlDatabase instance.
    workspaceDataSource.setOptions({ schema: workspaceSchemaName });

    const db = await SqlDatabase.fromDataSourceParams({
      appDataSource: workspaceDataSource,
    });

    const prompt =
      PromptTemplate.fromTemplate(`Based on the table schema below, write an SQL query that would answer the user's question:
      {schema}
      
      Question: {question}
      SQL Query:`);

    const model = new ChatOpenAI();

    const sqlQueryGeneratorChain = RunnableSequence.from([
      RunnablePassthrough.assign({
        schema: async () => db.getTableInfo(),
      }),
      prompt,
      model.bind({ stop: ['\nSQLResult:'] }),
      new StringOutputParser(),
    ]);

    const sqlQuery = await sqlQueryGeneratorChain.invoke({
      question: text,
    });

    const sqlQueryResult =
      await this.workspaceDataSourceService.executeRawQuery(
        sqlQuery,
        undefined,
        workspaceId,
      );

    return {
      sqlQuery,
      sqlQueryResult: JSON.stringify(sqlQueryResult),
    };
  }
}
