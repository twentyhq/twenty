import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { convertDollarsToCreditsMicro } from 'src/engine/metadata-modules/ai/ai-billing/utils/convert-dollars-to-credits-micro.util';

const buildStep = (
  inputTokens: number,
  outputTokens: number,
  toolNames: string[] = [],
) => ({
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
  toolCalls: toolNames.map((toolName) => ({ toolName })),
});

const COST_CONFIG = {
  getEvaluationModelConfig: () => ({
    modelId: 'test-model',
    inputCostPerMillionTokens: 1,
    outputCostPerMillionTokens: 2,
  }),
};

describe('AiBillingService', () => {
  it('records the tokens and cost of the steps a run finished', async () => {
    const usageRecorderService = { record: jest.fn() };
    const service = new AiBillingService(
      usageRecorderService as never,
      COST_CONFIG as never,
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

  it('charges the web searches a run made even when its token usage cannot be recorded', async () => {
    const usageLimitQuotaService = { charge: jest.fn() };
    const service = new AiBillingService(
      {
        record: jest.fn().mockRejectedValue(new Error('no billing period')),
      } as never,
      COST_CONFIG as never,
      {} as never,
      usageLimitQuotaService as never,
    );

    await expect(
      service.recordStepsUsage({
        modelId: 'test-model',
        steps: [buildStep(1_000, 500, ['web_search'])],
        workspaceId: 'workspace-id',
        operationType: UsageOperationType.AI_CHAT_TOKEN,
        spenders: { userWorkspaceId: 'user-workspace-id' },
      }),
    ).rejects.toThrow('no billing period');
    expect(usageLimitQuotaService.charge).toHaveBeenCalledWith(
      expect.objectContaining({
        events: [expect.objectContaining({ quantity: 1 })],
      }),
    );
  });
});
