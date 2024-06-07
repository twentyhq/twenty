import { Injectable } from '@nestjs/common';

import { ChatOpenAI } from '@langchain/openai';
import { SqlDatabase } from 'langchain/sql_db';
import { PromptTemplate } from '@langchain/core/prompts';
import {
  RunnablePassthrough,
  RunnableSequence,
} from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';

import { TextToSQLQueryResult } from 'src/engine/core-modules/text-to-sql/dtos/text-to-sql-query-result.dto';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';

@Injectable()
export class TextToSQLService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  async query(
    workspaceId: string,
    text: string,
  ): Promise<TextToSQLQueryResult> {
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
