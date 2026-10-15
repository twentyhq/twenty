import { type StepResult, type ToolSet } from 'ai';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { convertDollarsToCreditsMicro } from 'src/engine/metadata-modules/ai/ai-billing/utils/convert-dollars-to-credits-micro.util';

const buildStep = (
  inputTokens: number,
  outputTokens: number,
): StepResult<ToolSet> =>
  ({
    usage: {
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      inputTokenDetails: {
        noCacheTokens: inputTokens,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
      },
      outputTokenDetails: { textTokens: outputTokens, reasoningTokens: 0 },
    },
    content: [],
    toolCalls: [],
  }) as unknown as StepResult<ToolSet>;

describe('AiBillingService', () => {
  it('records the tokens and cost of the steps a run finished', async () => {
    const usageRecorderService = { record: jest.fn() };
    const service = new AiBillingService(
      usageRecorderService as never,
      {
        getEvaluationModelConfig: () => ({
          modelId: 'test-model',
          inputCostPerMillionTokens: 1,
          outputCostPerMillionTokens: 2,
        }),
      } as never,
      {} as never,
      {} as never,
    );

    await service.recordStepsUsage({
      modelId: 'test-model',
      steps: [buildStep(1_000, 500), buildStep(2_000, 0)],
      workspaceId: 'workspace-id',
      operationType: UsageOperationType.AI_WORKFLOW_TOKEN,
      spenders: { userWorkspaceId: 'user-workspace-id', agentId: 'agent-id' },
    });

    // 3,000 input tokens at $1 and 500 output tokens at $2 per million
    expect(usageRecorderService.record).toHaveBeenCalledWith('workspace-id', [
      expect.objectContaining({
        resourceType: UsageResourceType.AI,
        operationType: UsageOperationType.AI_WORKFLOW_TOKEN,
        creditsUsedMicro: convertDollarsToCreditsMicro(0.004),
        quantity: 3_500,
        unit: UsageUnit.TOKEN,
        resourceId: 'agent-id',
        resourceContext: 'test-model',
      }),
    ]);
  });
});
