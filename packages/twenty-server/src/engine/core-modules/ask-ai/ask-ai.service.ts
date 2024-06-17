import { Injectable } from '@nestjs/common';

import { SqlDatabase } from 'langchain/sql_db';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence, RunnableFunc } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { CallbackHandler, Langfuse } from 'langfuse-langchain';

import { AskAIQueryResult } from 'src/engine/core-modules/ask-ai/dtos/ask-ai-query-result.dto';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { WorkspaceQueryRunnerService } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.service';
import { ChatModelService } from 'src/modules/ai/services/chat-model/chat-model.service';

interface AskAIPromptTemplateInput {
  schema: string;
  question: string;
}

@Injectable()
export class AskAIService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly workspaceQueryRunnerService: WorkspaceQueryRunnerService,
    private readonly chatModelService: ChatModelService,
  ) {}

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

    // Does this have unintended side effects? It sets the schema of LangChain's SqlDatabase instance.
    workspaceDataSource.setOptions({ schema: workspaceSchemaName });

    const db = await SqlDatabase.fromDataSourceParams({
      appDataSource: workspaceDataSource,
      sampleRowsInTableInfo: 0,
    });

    const langfuse = new Langfuse();

    if (!process.env.LANGFUSE_ASK_AI_PROMPT_NAME) throw new Error();

    const promptTemplate =
      PromptTemplate.fromTemplate<AskAIPromptTemplateInput>(
        (
          await langfuse.getPrompt(process.env.LANGFUSE_ASK_AI_PROMPT_NAME)
        ).getLangchainPrompt(),
      );

    const removeSQLMarkdown: RunnableFunc<string, string> = (input) =>
      input.replace(/^```sql/, '').replace(/```$/, '');

    const sqlQueryGeneratorChain = RunnableSequence.from([
      promptTemplate,
      this.chatModelService.getChatModel(),
      new StringOutputParser(),
      removeSQLMarkdown,
    ]);

    const langfuseHandler = new CallbackHandler({
      secretKey: process.env.LANGFUSE_SECRET_KEY,
      publicKey: process.env.LANGFUSE_PUBLIC_KEY,
      baseUrl: 'https://cloud.langfuse.com',
      metadata: { workspaceId, userId, userEmail },
    });

    const sqlQuery = await sqlQueryGeneratorChain.invoke(
      {
        schema: await db.getTableInfo(),
        question: text,
      },
      {
        callbacks: [langfuseHandler],
      },
    );

    const sqlQueryResult = await this.workspaceQueryRunnerService.executeSQL(
      workspaceDataSource,
      workspaceId,
      sqlQuery,
    );

    return {
      sqlQuery,
      sqlQueryResult: JSON.stringify(sqlQueryResult),
    };
  }
}
