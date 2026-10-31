import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  convertToModelMessages,
  generateText,
  jsonSchema,
  NoObjectGeneratedError,
  NoOutputGeneratedError,
  Output,
  type TextStreamPart,
  type ToolSet,
} from 'ai';
import { type RunAgentMessage } from 'twenty-shared/application';
import {
  type AgentResponseFormat,
  type AgentResponseSchema,
  type ExtendedUIMessage,
} from 'twenty-shared/ai';
import { isDefined, isNonEmptyArray, isPlainObject } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';

import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type ExplicitObjectGrants } from 'src/engine/core-modules/tool-provider/interfaces/explicit-object-grants.type';
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
import { type ResolvedAgentRunPersona } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/resolved-agent-run-persona.type';
import { type AgentStructuredOutputStrategy } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-structured-output-strategy.type';
import { type AgentToolLoadingStrategy } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-tool-loading-strategy.type';
import { assertAgentResponseFormatHasOutputFieldsOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/assert-agent-response-format-has-output-fields-or-throw.util';
import { buildAgentRolePermissionConfig } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-role-permission-config.util';
import { buildStrictAgentResponseSchema } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-strict-agent-response-schema.util';
import { getCallLevelProviderOptions } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/provider-options.util';
import { resolveAgentRunCallingApplication } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/resolve-agent-run-calling-application.util';
import { resolveAiRunPermissionScope } from 'src/engine/permissions/role/utils/resolve-ai-run-permission-scope.util';
import { replaceUnsupportedFileParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/replace-unsupported-file-parts.util';
import { AiAgentRoleService } from 'src/engine/metadata-modules/ai/ai-agent-role/ai-agent-role.service';
import { STRUCTURED_OUTPUT_SYSTEM_PROMPT } from 'src/engine/metadata-modules/ai/ai-agent/constants/structured-output-system-prompt.const';
import { NATIVE_WEB_SEARCH_COST_PER_CALL_DOLLARS } from 'src/engine/metadata-modules/ai/ai-billing/constants/native-web-search-cost-per-call-dollars';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { type AgentTurnUsageStep } from 'src/engine/metadata-modules/ai/ai-billing/utils/add-step-to-agent-turn-usage.util';
import { convertDollarsToCreditsMicro } from 'src/engine/metadata-modules/ai/ai-billing/utils/convert-dollars-to-credits-micro.util';
import { countNativeWebSearchCallsFromSteps } from 'src/engine/metadata-modules/ai/ai-billing/utils/count-native-web-search-calls-from-steps.util';
import { extractCacheCreationTokensFromSteps } from 'src/engine/metadata-modules/ai/ai-billing/utils/extract-cache-creation-tokens.util';
import { mergeLanguageModelUsage } from 'src/engine/metadata-modules/ai/ai-billing/utils/merge-language-model-usage.util';
import { type AgentTurnStreamSource } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-turn-stream.service';
import { buildAiTelemetry } from 'src/engine/metadata-modules/ai/ai-models/utils/build-ai-telemetry.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type RolePermissionConfig } from 'src/engine/permissions/principal/types/role-permission-config.type';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

type AgentRunTurnInput = {
  persona: ResolvedAgentRunPersona;
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
  structuredOutputStrategy?: AgentStructuredOutputStrategy;
  abortSignal?: AbortSignal;
};

export type StartedAgentRunTurn = {
  turn: AgentTurn;
  source: AgentTurnStreamSource;
};

export type CompletedAgentRunTurn = AgentExecutionResult & {
  // a follow-up structured output request is not part of the stream, so the turn's usage must add it
  structuredOutputSteps: AgentTurnUsageStep[];
};

const buildStructuredOutput = (schema: AgentResponseSchema) =>
  Output.object({
    schema: jsonSchema(buildStrictAgentResponseSchema(schema)),
  });

const buildSpenders = ({
  persona,
  executionContext,
}: Pick<AgentRunTurnInput, 'persona' | 'executionContext'>): UsageSpenders => ({
  userWorkspaceId: executionContext.userWorkspaceId,
  agentId: persona.agentId,
  applicationId: persona.applicationId,
});

@Injectable()
export class AgentRunTurnService {
  constructor(
    private readonly agentTurnService: AgentTurnService,
    private readonly aiBillingService: AiBillingService,
    private readonly aiAgentRoleService: AiAgentRoleService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly runAgentAttachmentService: RunAgentAttachmentService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async startTurn({
    persona,
    responseFormat,
    messages,
    baseSystemPrompt,
    workspaceId,
    executionContext,
    additionalExcludedToolNames = [],
    toolLoadingStrategy = 'preload',
    structuredOutputStrategy = 'follow-up-request',
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
    const spenders = buildSpenders({ persona, executionContext });

    await this.aiBillingService.assertAiExecutionAllowed({
      workspaceId,
      operationType: usageOperationType,
      spenders,
    });

    const workspace = await this.workspaceRepository.findOneBy({
      id: workspaceId,
    });
    const registryAccess = await this.buildAgentRegistryAccess({
      persona,
      workspaceId,
      executionContext,
      additionalExcludedToolNames,
      toolLoadingStrategy,
    });

    const turn = await this.agentTurnService.start({
      workspace: workspace ?? undefined,
      modelId: persona.modelId,
      toolset: {
        registryAccess,
        nativeToolOptions: {
          webSearch: persona.modelConfiguration?.webSearch?.enabled ?? false,
          twitterSearch:
            persona.modelConfiguration?.twitterSearch?.enabled ?? false,
        },
        canAskHumans,
        waitTools: pausingTools,
      },
      buildContext: async ({ modelConfig, toolset }) => ({
        systemPrompt: `${baseSystemPrompt}\n\n${persona.instructions}${
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
      promptCacheKey: persona.promptCacheKey,
      output:
        structuredOutputStrategy === 'same-request' &&
        responseFormat?.type === 'json'
          ? buildStructuredOutput(responseFormat.schema)
          : undefined,
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
        agentId: persona.agentId ?? undefined,
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

  // a follow-up structured output request is not part of the stream, so its usage is added to the turn's here
  async completeTurn({
    started: { turn },
    persona,
    responseFormat,
    workspaceId,
    executionContext,
    structuredOutputStrategy = 'follow-up-request',
    abortSignal,
  }: Pick<
    AgentRunTurnInput,
    | 'persona'
    | 'responseFormat'
    | 'workspaceId'
    | 'executionContext'
    | 'structuredOutputStrategy'
    | 'abortSignal'
  > & {
    started: StartedAgentRunTurn;
  }): Promise<CompletedAgentRunTurn> {
    const { userWorkspaceId, usageOperationType } = executionContext;
    const spenders = buildSpenders({ persona, executionContext });
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

    // a stopped run fails whatever it returned, so it spends no request on its output
    const isStructuredOutputExpected =
      isDefined(agentSchema) && !isPaused && !isDefined(stopReason);

    if (
      isStructuredOutputExpected &&
      structuredOutputStrategy === 'same-request'
    ) {
      result = await this.readSameRequestOutputOrThrow(turn);
    } else if (isStructuredOutputExpected) {
      const structuredResult = await generateText({
        instructions: STRUCTURED_OUTPUT_SYSTEM_PROMPT,
        model: registeredModel.model,
        prompt: `Based on the following execution results, generate the structured output according to the schema:

                 Execution Results: ${text}

                 Please generate the structured output based on the execution results and context above.`,
        output: buildStructuredOutput(agentSchema),
        abortSignal,
        providerOptions: getCallLevelProviderOptions({
          sdkPackage: registeredModel.sdkPackage,
          providerOptions: undefined,
          promptCacheKey: persona.promptCacheKey,
        }),
        ...buildAiTelemetry({
          functionId: 'agent-structured-output',
          workspaceId,
          userWorkspaceId,
          agentId: persona.agentId ?? undefined,
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

  private async readSameRequestOutputOrThrow(turn: AgentTurn): Promise<object> {
    const output: unknown = await Promise.resolve(turn.stream.output).catch(
      (error: unknown) => {
        // only a reply that parses into no object is a format failure; anything else keeps its own cause
        if (
          NoObjectGeneratedError.isInstance(error) ||
          NoOutputGeneratedError.isInstance(error)
        ) {
          return undefined;
        }

        throw error;
      },
    );

    if (!isPlainObject(output)) {
      throw new AiException(
        'The model did not return an object matching the response format',
        AiExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }

    return output;
  }

  private async buildAgentRegistryAccess({
    persona,
    workspaceId,
    executionContext: { authContext, actorContext, agentRunRoleIds },
    additionalExcludedToolNames,
    toolLoadingStrategy,
  }: Pick<
    Required<AgentRunTurnInput>,
    | 'persona'
    | 'workspaceId'
    | 'executionContext'
    | 'additionalExcludedToolNames'
    | 'toolLoadingStrategy'
  >): Promise<AgentRegistryAccess> {
    const grants = await this.resolveRegistryGrants({
      persona,
      workspaceId,
      agentRunRoleIds,
    });

    if (!isDefined(grants)) {
      return { type: 'none' };
    }

    const toolContext: ToolContext = {
      workspaceId,
      agentId: persona.agentId ?? undefined,
      authContext,
      application: resolveAgentRunCallingApplication(authContext),
      actorContext,
      rolePermissionConfig: grants.rolePermissionConfig,
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
          explicitObjectGrants: grants.explicitObjectGrants,
          categories: PRELOADED_AGENT_REGISTRY_TOOL_CATEGORIES,
          excludedToolNames,
        };
  }

  // null when the run may use no data tools at all
  private async resolveRegistryGrants({
    persona: { permissions },
    workspaceId,
    agentRunRoleIds,
  }: {
    persona: Pick<ResolvedAgentRunPersona, 'permissions'>;
    workspaceId: string;
    agentRunRoleIds: AgentRunExecutionContext['agentRunRoleIds'];
  }): Promise<{
    rolePermissionConfig: RolePermissionConfig;
    explicitObjectGrants: ExplicitObjectGrants;
  } | null> {
    if (permissions.type === 'agentRole') {
      const agentRoleId = await this.aiAgentRoleService.findAgentRoleId({
        workspaceId: permissions.workspaceId,
        agentId: permissions.agentId,
      });

      if (!isDefined(agentRoleId)) {
        return null;
      }

      return {
        rolePermissionConfig: buildAgentRolePermissionConfig({
          agentRoleId,
          agentRunRoleIds,
        }),
        explicitObjectGrants: { type: 'role', roleId: agentRoleId },
      };
    }

    const { scope } = permissions;

    if (!isDefined(scope)) {
      return null;
    }

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    return {
      rolePermissionConfig: {
        intersectionOf: { ...agentRunRoleIds },
        scope: resolveAiRunPermissionScope({
          scope,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
        }),
      },
      explicitObjectGrants: { type: 'scope', scope },
    };
  }
}
