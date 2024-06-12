import { Injectable } from '@nestjs/common';

import { ChatOpenAI } from '@langchain/openai';
import { SqlDatabase } from 'langchain/sql_db';
import { PromptTemplate } from '@langchain/core/prompts';
import {
  RunnablePassthrough,
  RunnableSequence,
} from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { CallbackHandler, Langfuse } from 'langfuse-langchain';

import { AskAIQueryResult } from 'src/engine/core-modules/ask-ai/dtos/ask-ai-query-result.dto';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';

@Injectable()
export class AskAIService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  async query(workspaceId: string, text: string): Promise<AskAIQueryResult> {
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
      sampleRowsInTableInfo: 0,
    });

    const langfuse = new Langfuse();

    if (!process.env.LANGFUSE_ASK_AI_PROMPT_NAME) throw new Error();

    const promptTemplate = PromptTemplate.fromTemplate(
      (
        await langfuse.getPrompt(process.env.LANGFUSE_ASK_AI_PROMPT_NAME)
      ).getLangchainPrompt(),
    );

    const model = new ChatOpenAI();

    const sqlQueryGeneratorChain = RunnableSequence.from([
      RunnablePassthrough.assign({
        schema: async () => db.getTableInfo(),
      }),
      promptTemplate,
      model.bind({ stop: ['\nSQLResult:'] }),
      new StringOutputParser(),
    ]);

    const langfuseHandler = new CallbackHandler({
      secretKey: process.env.LANGFUSE_SECRET_KEY,
      publicKey: process.env.LANGFUSE_PUBLIC_KEY,
      baseUrl: 'https://cloud.langfuse.com',
    });

    const sqlQuery = await sqlQueryGeneratorChain.invoke(
      {
        question: text,
      },
      {
        callbacks: [langfuseHandler],
      },
    );

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
