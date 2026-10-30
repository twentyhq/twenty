import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  convertToModelMessages,
  generateText,
  jsonSchema,
  Output,
  type TextStreamPart,
  type ToolSet,
} from 'ai';
import { type RunAgentMessage } from 'twenty-shared/application';
import {
  type AgentResponseFormat,
  type ExtendedUIMessage,
} from 'twenty-shared/ai';
import {
  isDefined,
  isNonEmptyArray,
  tipTapDocumentToMarkdown,
} from 'twenty-shared/utils';
import { type Repository } from 'typeorm';

import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type ToolContext } from 'src/engine/core-modules/tool-provider/types/tool-context.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageSpenders } from 'src/engine/core-modules/usage/types/usage-spenders.type';
import { buildToolCatalogSection } from 'src/engine/core-modules/tool-provider/utils/build-tool-catalog-section.util';
import { OUTPUT_NAVIGATION_TOOL_NAMES } from 'src/engine/core-modules/tool/tools/output-navigation-tool/constants/output-navigation-tool-names.constant';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AGENT_RUN_EXCLUDED_TOOL_NAMES } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/agent-run-excluded-tool-names.const';
import { OPEN_ENDED_AGENT_REGISTRY_TOOL_CATEGORIES } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/open-ended-agent-registry-tool-categories.const';
import { PRELOADED_AGENT_REGISTRY_TOOL_CATEGORIES } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/preloaded-agent-registry-tool-categories.const';
import { endsOnPausingToolCall } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/ends-on-pausing-tool-call.util';
import { type AgentRegistryAccess } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-toolset.service';
import {
  type AgentTurn,
  AgentTurnService,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-turn.service';
import { RunAgentAttachmentService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/run-agent-attachment.service';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { type AgentRunExecutionContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-execution-context.type';
import { type AgentToolLoadingStrategy } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-tool-loading-strategy.type';
import { assertAgentResponseFormatHasOutputFieldsOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/assert-agent-response-format-has-output-fields-or-throw.util';
import { buildAgentRolePermissionConfig } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-role-permission-config.util';
import { buildStrictAgentResponseSchema } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-strict-agent-response-schema.util';
import { getCallLevelProviderOptions } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/provider-options.util';
import { resolveAgentRunCallingApplication } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/resolve-agent-run-calling-application.util';
import { replaceUnsupportedFileParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/replace-unsupported-file-parts.util';
import { AiAgentRoleService } from 'src/engine/metadata-modules/ai/ai-agent-role/ai-agent-role.service';
import { STRUCTURED_OUTPUT_SYSTEM_PROMPT } from 'src/engine/metadata-modules/ai/ai-agent/constants/structured-output-system-prompt.const';
import { type AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { NATIVE_WEB_SEARCH_COST_PER_CALL_DOLLARS } from 'src/engine/metadata-modules/ai/ai-billing/constants/native-web-search-cost-per-call-dollars';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { type AgentTurnUsageStep } from 'src/engine/metadata-modules/ai/ai-billing/utils/add-step-to-agent-turn-usage.util';
import { convertDollarsToCreditsMicro } from 'src/engine/metadata-modules/ai/ai-billing/utils/convert-dollars-to-credits-micro.util';
import { countNativeWebSearchCallsFromSteps } from 'src/engine/metadata-modules/ai/ai-billing/utils/count-native-web-search-calls-from-steps.util';
import { extractCacheCreationTokensFromSteps } from 'src/engine/metadata-modules/ai/ai-billing/utils/extract-cache-creation-tokens.util';
import { mergeLanguageModelUsage } from 'src/engine/metadata-modules/ai/ai-billing/utils/merge-language-model-usage.util';
import { type AgentTurnStreamSource } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-turn-stream.service';
import { buildAiTelemetry } from 'src/engine/metadata-modules/ai/ai-models/utils/build-ai-telemetry.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

type AgentRunTurnInput = {
  agent: AgentEntity;
  responseFormat?: AgentResponseFormat;
  messages: RunAgentMessage[];
  // a continued conversation, with the tool calls and results plain run messages cannot carry
  priorMessages?: ExtendedUIMessage[];
  pausingTools?: ToolSet;
  canAskHumans?: boolean;
  baseSystemPrompt: string;
  workspaceId: string;
  executionContext: AgentRunExecutionContext;
  additionalExcludedToolNames?: readonly string[];
  toolLoadingStrategy?: AgentToolLoadingStrategy;
  abortSignal?: AbortSignal;
};

export type StartedAgentRunTurn = {
  turn: AgentTurn;
  source: AgentTurnStreamSource;
};

export type CompletedAgentRunTurn = AgentExecutionResult & {
  // the structured output request is not part of the stream, so the turn's usage must add it
  structuredOutputSteps: AgentTurnUsageStep[];
};

const buildSpenders = ({
  agent,
  executionContext,
}: Pick<AgentRunTurnInput, 'agent' | 'executionContext'>): UsageSpenders => ({
  userWorkspaceId: executionContext.userWorkspaceId,
  agentId: agent.id,
  applicationId: agent.applicationId,
});

@Injectable()
export class AgentRunTurnService {
  constructor(
    private readonly agentTurnService: AgentTurnService,
    private readonly aiBillingService: AiBillingService,
    private readonly aiAgentRoleService: AiAgentRoleService,
    private readonly runAgentAttachmentService: RunAgentAttachmentService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async startTurn({
    agent,
    responseFormat,
    messages,
    baseSystemPrompt,
    workspaceId,
    executionContext,
    additionalExcludedToolNames = [],
    toolLoadingStrategy = 'preload',
    priorMessages = [],
    pausingTools = {},
    canAskHumans = false,
    abortSignal,
  }: AgentRunTurnInput): Promise<StartedAgentRunTurn> {
    if (!isNonEmptyArray(messages) && !isNonEmptyArray(priorMessages)) {
      throw new AiException(
        'Provide at least one message to run an agent',
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }

    assertAgentResponseFormatHasOutputFieldsOrThrow(responseFormat);

    const { userWorkspaceId, usageOperationType } = executionContext;
    const spenders = buildSpenders({ agent, executionContext });

    await this.aiBillingService.assertAiExecutionAllowed({
      workspaceId,
      operationType: usageOperationType,
      spenders,
    });

    const workspace = await this.workspaceRepository.findOneBy({
      id: workspaceId,
    });
    const registryAccess = await this.buildAgentRegistryAccess({
      agent,
      executionContext,
      additionalExcludedToolNames,
      toolLoadingStrategy,
    });

    const turn = await this.agentTurnService.start({
      workspace: workspace ?? undefined,
      modelId: agent.modelId,
      toolset: {
        registryAccess,
        nativeToolOptions: {
          webSearch: agent.modelConfiguration?.webSearch?.enabled === true,
          twitterSearch:
            agent.modelConfiguration?.twitterSearch?.enabled === true,
        },
        canAskHumans,
        waitTools: pausingTools,
      },
      buildContext: async ({ modelConfig, toolset }) => ({
        systemPrompt: `${baseSystemPrompt}\n\n${tipTapDocumentToMarkdown(agent.prompt)}${
          registryAccess.type === 'catalog'
            ? buildToolCatalogSection(toolset.toolCatalog, [])
            : ''
        }`,
        messages: [
          ...(await convertToModelMessages(
            replaceUnsupportedFileParts(
              priorMessages,
              modelConfig.modalities,
              false,
            ),
          )),
          ...(await this.runAgentAttachmentService.buildModelMessagesOrThrow({
            messages,
            workspaceId,
            modalities: modelConfig.modalities,
          })),
        ],
      }),
      promptCacheKey: agent.id,
      abortSignal,
      billing: {
        workspaceId,
        operationType: usageOperationType,
        webSearchOperationType: UsageOperationType.AI_WORKFLOW_WEB_SEARCH,
        spenders,
      },
      telemetry: {
        functionId: 'agent-execution',
        workspaceId,
        userWorkspaceId,
        agentId: agent.id,
      },
      // nobody resends a background run, so a provider error after streaming started is retried here
      streamRetries: 2,
      metricsScope: 'agent',
    });

    let streamError: unknown;

    return {
      turn,
      source: {
        // a retried provider error never reaches the stream, so only an error part fails the run
        parts: turn.stream.stream.pipeThrough(
          new TransformStream<TextStreamPart<ToolSet>, TextStreamPart<ToolSet>>(
            {
              transform: (part, controller) => {
                if (part.type === 'error') {
                  streamError ??= part.error;
                }

                controller.enqueue(part);
              },
            },
          ),
        ),
        modelConfig: turn.modelConfig,
        getStreamError: () => streamError,
      },
    };
  }

  // the structured output request is not part of the stream, so its usage is added to the turn's here
  async completeTurn({
    started: { turn },
    agent,
    responseFormat,
    workspaceId,
    executionContext,
    abortSignal,
  }: Pick<
    AgentRunTurnInput,
    | 'agent'
    | 'responseFormat'
    | 'workspaceId'
    | 'executionContext'
    | 'abortSignal'
  > & {
    started: StartedAgentRunTurn;
  }): Promise<CompletedAgentRunTurn> {
    const { userWorkspaceId, usageOperationType } = executionContext;
    const spenders = buildSpenders({ agent, executionContext });
    const [text, loopUsage, loopSteps] = await Promise.all([
      turn.stream.text,
      turn.stream.usage,
      turn.stream.steps,
    ]);
    const { registeredModel, toolset } = turn;
    const isPaused = endsOnPausingToolCall({
      steps: loopSteps,
      offeredToolNames: toolset.offeredPausingToolNames,
    });
    const agentSchema =
      responseFormat?.type === 'json' ? responseFormat.schema : undefined;

    const stopReason = turn.getStopReason();
    let result: object = { response: text };
    let usage = loopUsage;
    let steps = loopSteps;
    let structuredOutputSteps: AgentTurnUsageStep[] = [];

    if (isDefined(agentSchema) && !isPaused) {
      const structuredResult = await generateText({
        instructions: STRUCTURED_OUTPUT_SYSTEM_PROMPT,
        model: registeredModel.model,
        prompt: `Based on the following execution results, generate the structured output according to the schema:

                 Execution Results: ${text}

                 Please generate the structured output based on the execution results and context above.`,
        output: Output.object({
          schema: jsonSchema(buildStrictAgentResponseSchema(agentSchema)),
        }),
        abortSignal,
        providerOptions: getCallLevelProviderOptions({
          sdkPackage: registeredModel.sdkPackage,
          providerOptions: undefined,
          promptCacheKey: agent.id,
        }),
        ...buildAiTelemetry({
          functionId: 'agent-structured-output',
          workspaceId,
          userWorkspaceId,
          agentId: agent.id,
        }),
      });

      void this.aiBillingService.calculateAndBillUsage({
        modelId: registeredModel.modelId,
        billingInput: {
          usage: structuredResult.usage,
          cacheCreationTokens: extractCacheCreationTokensFromSteps(
            structuredResult.steps,
          ),
        },
        workspaceId,
        operationType: usageOperationType,
        spenders,
      });

      usage = mergeLanguageModelUsage(usage, structuredResult.usage);
      steps = [...steps, ...structuredResult.steps];
      structuredOutputSteps = structuredResult.steps;

      if (structuredResult.output == null) {
        throw new AiException(
          'Failed to generate structured output from execution results',
          AiExceptionCode.AGENT_EXECUTION_FAILED,
        );
      }

      result = structuredResult.output as object;
    }

    const nativeWebSearchCallCount = countNativeWebSearchCallsFromSteps(steps);
    const totalCostInDollars =
      this.aiBillingService.calculateStepsCost(registeredModel.modelId, steps) +
      nativeWebSearchCallCount * NATIVE_WEB_SEARCH_COST_PER_CALL_DOLLARS;

    return {
      result,
      usage,
      cacheCreationTokens: extractCacheCreationTokensFromSteps(steps),
      nativeWebSearchCallCount,
      stopReason,
      // out of credits fails the execution even if it asked something, so it is never left waiting for an answer
      isPaused: isPaused && !isDefined(stopReason),
      steps,
      modelId: registeredModel.modelId,
      totalCostInDollars,
      creditsUsedMicro: convertDollarsToCreditsMicro(totalCostInDollars),
      structuredOutputSteps,
    };
  }

  private async buildAgentRegistryAccess({
    agent,
    executionContext: { authContext, actorContext, agentRunRoleIds },
    additionalExcludedToolNames,
    toolLoadingStrategy,
  }: Pick<
    Required<AgentRunTurnInput>,
    | 'agent'
    | 'executionContext'
    | 'additionalExcludedToolNames'
    | 'toolLoadingStrategy'
  >): Promise<AgentRegistryAccess> {
    const agentRoleId = await this.aiAgentRoleService.findAgentRoleId({
      workspaceId: agent.workspaceId,
      agentId: agent.id,
    });

    if (!isDefined(agentRoleId)) {
      return { type: 'none' };
    }

    const toolContext: ToolContext = {
      workspaceId: agent.workspaceId,
      agentId: agent.id,
      authContext,
      application: resolveAgentRunCallingApplication(authContext),
      actorContext,
      rolePermissionConfig: buildAgentRolePermissionConfig({
        agentRoleId,
        agentRunRoleIds,
      }),
      ...(isDefined(authContext) && isUserAuthContext(authContext)
        ? {
            userId: authContext.user.id,
            userWorkspaceId: authContext.userWorkspaceId,
          }
        : {}),
    };
    const excludedToolNames = [
      ...OUTPUT_NAVIGATION_TOOL_NAMES,
      ...AGENT_RUN_EXCLUDED_TOOL_NAMES,
      ...additionalExcludedToolNames,
    ];

    // open-ended agents reach too many tools to send them all; a few granted ones are cheaper sent than learned
    return toolLoadingStrategy === 'lazy'
      ? {
          type: 'catalog',
          toolContext,
          categories: OPEN_ENDED_AGENT_REGISTRY_TOOL_CATEGORIES,
          excludedToolNames,
        }
      : {
          type: 'granted',
          toolContext,
          agentRoleId,
          categories: PRELOADED_AGENT_REGISTRY_TOOL_CATEGORIES,
          excludedToolNames,
        };
  }
}
