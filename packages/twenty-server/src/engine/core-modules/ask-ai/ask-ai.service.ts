import { Injectable } from '@nestjs/common';

import { SqlDatabase } from 'langchain/sql_db';
import { RunnableSequence, RunnableFunc } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { CallbackHandler } from 'langfuse-langchain';

import { LLMPromptTemplateEnvVar } from 'src/engine/integrations/llm-prompt-template/interfaces/llm-prompt-template-name.interface';

import { AskAIQueryResult } from 'src/engine/core-modules/ask-ai/dtos/ask-ai-query-result.dto';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { WorkspaceQueryRunnerService } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.service';
import { LLMPromptTemplateService } from 'src/engine/integrations/llm-prompt-template/llm-prompt-template.service';
import { LLMChatModelService } from 'src/engine/integrations/llm-chat-model/llm-chat-model.service';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';

@Injectable()
export class AskAIService {
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly workspaceQueryRunnerService: WorkspaceQueryRunnerService,
    private readonly llmChatModelService: LLMChatModelService,
    private readonly llmPromptTemplateService: LLMPromptTemplateService,
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

    workspaceDataSource.setOptions({ schema: workspaceSchemaName });

    const db = await SqlDatabase.fromDataSourceParams({
      appDataSource: workspaceDataSource,
      sampleRowsInTableInfo: 0,
    });

    const promptTemplate =
      await this.llmPromptTemplateService.getPromptTemplate(
        LLMPromptTemplateEnvVar.AskAI,
      );

    const removeSQLMarkdown: RunnableFunc<string, string> = (input) =>
      input
        .replace(/^```sql/, '')
        .replace(/```$/, '')
        .trim();

    const sqlQueryGeneratorChain = RunnableSequence.from([
      promptTemplate,
      this.llmChatModelService.getChatModel(),
      new StringOutputParser(),
      removeSQLMarkdown,
    ]);

    const langfuseHandler = new CallbackHandler({
      secretKey: this.environmentService.get('LANGFUSE_SECRET_KEY'),
      publicKey: this.environmentService.get('LANGFUSE_PUBLIC_KEY'),
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

    try {
      const sqlQueryResult = await this.workspaceQueryRunnerService.executeSQL(
        workspaceDataSource,
        workspaceId,
        sqlQuery,
      );

      return {
        sqlQuery,
        sqlQueryResult: JSON.stringify(sqlQueryResult),
      };
    } catch (e) {
      return {
        sqlQuery,
      };
    }
  }
}
