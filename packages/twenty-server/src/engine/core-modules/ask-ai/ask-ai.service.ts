import { Injectable } from '@nestjs/common';

import { SqlDatabase } from 'langchain/sql_db';
import { RunnableSequence, RunnableFunc } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';

import { LLMPromptTemplateEnvVar } from 'src/engine/integrations/llm-prompt-template/interfaces/llm-prompt-template-name.interface';

import { AskAIQueryResult } from 'src/engine/core-modules/ask-ai/dtos/ask-ai-query-result.dto';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { WorkspaceQueryRunnerService } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.service';
import { LLMPromptTemplateService } from 'src/engine/integrations/llm-prompt-template/llm-prompt-template.service';
import { LLMChatModelService } from 'src/engine/integrations/llm-chat-model/llm-chat-model.service';
import { LLMTracingService } from 'src/engine/integrations/llm-tracing/llm-tracing.service';

@Injectable()
export class AskAIService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly workspaceQueryRunnerService: WorkspaceQueryRunnerService,
    private readonly llmChatModelService: LLMChatModelService,
    private readonly llmPromptTemplateService: LLMPromptTemplateService,
    private readonly llmTracingService: LLMTracingService,
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

    const metadata = {
      workspaceId,
      userId,
      userEmail,
    };
    const tracingCallbackHandler =
      this.llmTracingService.getCallbackHandler(metadata);

    const sqlQuery = await sqlQueryGeneratorChain.invoke(
      {
        schema: await db.getTableInfo(),
        question: text,
      },
      {
        callbacks: [tracingCallbackHandler],
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
