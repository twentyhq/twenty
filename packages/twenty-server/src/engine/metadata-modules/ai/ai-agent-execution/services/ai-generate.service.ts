import { Injectable } from '@nestjs/common';

import { isString } from '@sniptt/guards';
import { AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID } from 'twenty-shared/ai';
import {
  generateInputSchema,
  type GenerateResult,
} from 'twenty-shared/application';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type FlatApiKey } from 'src/engine/core-modules/api-key/types/flat-api-key.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AgentRunCallerContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-caller-context.service';
import { AgentRunnerService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-runner.service';
import { type AgentRunnerOutcome } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-runner-outcome.type';
import { assertAgentResponseFormatHasOutputFieldsOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/assert-agent-response-format-has-output-fields-or-throw.util';
import { parseAgentInputOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/parse-agent-input-or-throw.util';
import { resolveAgentRunCallerRefOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/resolve-agent-run-caller-ref-or-throw.util';
import { AGENT_RUN_BASE_SYSTEM_PROMPT } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-run-base-system-prompt.const';

type GeneratedOutput = Pick<GenerateResult, 'text' | 'object' | 'error'>;

const readGeneratedOutput = ({
  outcome,
  isJsonResponse,
}: {
  outcome: AgentRunnerOutcome;
  isJsonResponse: boolean;
}): GeneratedOutput => {
  if (outcome.status === 'FAILED') {
    return { text: null, object: null, error: outcome.error };
  }

  if (outcome.status !== 'COMPLETED' || !isPlainObject(outcome.result)) {
    return { text: null, object: null, error: 'The run returned no result' };
  }

  if (isJsonResponse) {
    return { text: null, object: outcome.result, error: null };
  }

  return isString(outcome.result.response)
    ? { text: outcome.result.response, object: null, error: null }
    : { text: null, object: null, error: 'The run returned no text' };
};

@Injectable()
export class AiGenerateService {
  constructor(
    private readonly agentRunCallerContextService: AgentRunCallerContextService,
    private readonly agentRunnerService: AgentRunnerService,
  ) {}

  async generate({
    workspace,
    requestUserWorkspaceId,
    requestWorkspaceMemberId,
    callerApplication,
    callerApiKey,
    input,
  }: {
    workspace: FlatWorkspace;
    requestUserWorkspaceId: string | null;
    requestWorkspaceMemberId: string | null;
    callerApplication?: FlatApplication;
    callerApiKey?: FlatApiKey;
    input: unknown;
  }): Promise<GenerateResult> {
    const { input: messages, ...settings } = parseAgentInputOrThrow({
      schema: generateInputSchema,
      input,
    });
    const responseFormat = settings.responseFormat ?? undefined;

    assertAgentResponseFormatHasOutputFieldsOrThrow(responseFormat);

    const executionContext =
      await this.agentRunCallerContextService.buildExecutionContext({
        workspace,
        callerRef: resolveAgentRunCallerRefOrThrow({
          callerApplication,
          callerApiKey,
          requestUserWorkspaceId,
          requestWorkspaceMemberId,
        }),
        requestUserWorkspaceId,
        application: callerApplication,
        callerApplication,
      });

    const { runId, outcome, usage } =
      await this.agentRunnerService.runInRequest({
        workspaceId: workspace.id,
        executionContext,
        spec: {
          agentId: null,
          inlineConfig: {
            instructions: settings.instructions ?? '',
            modelId: settings.modelId ?? AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
            modelConfiguration: null,
            scope: settings.scope ?? null,
            applicationId: callerApplication?.id ?? null,
            promptCacheKey: `ai-generate:${callerApplication?.id ?? workspace.id}`,
          },
          title: 'Generate',
          baseSystemPrompt: AGENT_RUN_BASE_SYSTEM_PROMPT,
          instructions: null,
          responseFormat,
          capabilities: { canAskHumans: false },
          structuredOutputStrategy: 'same-request',
        },
        prompt: {
          messages,
          senderUserWorkspaceId: requestUserWorkspaceId,
          senderApplicationId: callerApplication?.id ?? null,
        },
      });

    const output = readGeneratedOutput({
      outcome,
      isJsonResponse: responseFormat?.type === 'json',
    });

    return {
      ...output,
      success: !isDefined(output.error),
      runId,
      usage,
    };
  }
}
