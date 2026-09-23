import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { useAiModelTiers } from '@/ai/hooks/useAiModelTiers';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiModelTiersState } from '@/client-config/states/aiModelTiersState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import {
  AiModelTier,
  type ClientAiModelConfig,
} from '~/generated-metadata/graphql';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

const buildModel = ({
  modelId,
  outputTokensPerSecond,
  intelligenceIndex,
  inputCostPerMillionTokens,
}: {
  modelId: string;
  outputTokensPerSecond: number;
  intelligenceIndex: number;
  inputCostPerMillionTokens: number;
}): ClientAiModelConfig => ({
  modelId,
  label: modelId,
  sdkPackage: null,
  outputTokensPerSecond,
  intelligenceIndex,
  inputCostPerMillionTokens,
  outputCostPerMillionTokens: inputCostPerMillionTokens * 4,
});

const models = [
  buildModel({
    modelId: 'openai/luna',
    outputTokensPerSecond: 120,
    intelligenceIndex: 36,
    inputCostPerMillionTokens: 0.5,
  }),
  buildModel({
    modelId: 'openai/terra',
    outputTokensPerSecond: 100,
    intelligenceIndex: 40,
    inputCostPerMillionTokens: 2,
  }),
  buildModel({
    modelId: 'openai/sol',
    outputTokensPerSecond: 60,
    intelligenceIndex: 48,
    inputCostPerMillionTokens: 4,
  }),
  buildModel({
    modelId: 'anthropic/opus',
    outputTokensPerSecond: 50,
    intelligenceIndex: 50,
    inputCostPerMillionTokens: 5,
  }),
];

const instanceTiers = [
  { tier: AiModelTier.extraFast, modelId: 'openai/luna' },
  { tier: AiModelTier.fast, modelId: 'openai/luna' },
  { tier: AiModelTier.balanced, modelId: 'openai/terra' },
  { tier: AiModelTier.smart, modelId: 'openai/sol' },
  { tier: AiModelTier.extraSmart, modelId: 'openai/missing' },
];

const renderHooks = () =>
  renderHook(
    () => ({
      setAiModels: useSetAtomState(aiModelsState),
      setAiModelTiers: useSetAtomState(aiModelTiersState),
      setCurrentWorkspace: useSetAtomState(currentWorkspaceState),
      tiers: useAiModelTiers(),
    }),
    { wrapper: Wrapper },
  );

describe('useAiModelTiers', () => {
  beforeEach(() => {
    resetJotaiStore();
  });

  it('resolves every tier from the instance defaults with deltas against Balanced', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.setAiModels(models);
      result.current.setAiModelTiers(instanceTiers);
      result.current.setCurrentWorkspace(mockCurrentWorkspace);
    });

    const fast = result.current.tiers.find((tier) => tier.tier === 'fast');
    const extraSmart = result.current.tiers.find(
      (tier) => tier.tier === 'extraSmart',
    );

    expect(result.current.tiers.map((tier) => tier.tier)).toEqual([
      'extraFast',
      'fast',
      'balanced',
      'smart',
      'extraSmart',
    ]);
    expect(fast?.model?.modelId).toBe('openai/luna');
    expect(fast?.speedDeltaPercent).toBe(20);
    expect(fast?.intelligenceDeltaPercent).toBe(-10);
    expect(fast?.costDeltaPercent).toBe(-75);
    expect(extraSmart?.model).toBeUndefined();
    expect(extraSmart?.speedDeltaPercent).toBeUndefined();
  });

  it('uses the workspace pin only while automatic selection is off', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.setAiModels(models);
      result.current.setAiModelTiers(instanceTiers);
      result.current.setCurrentWorkspace({
        ...mockCurrentWorkspace,
        isAutoModelSelectionEnabled: false,
        aiModelIdByTier: { smart: 'anthropic/opus', fast: 'openai/gone' },
      });
    });

    const smart = result.current.tiers.find((tier) => tier.tier === 'smart');
    const fast = result.current.tiers.find((tier) => tier.tier === 'fast');

    expect(smart?.model?.modelId).toBe('anthropic/opus');
    expect(smart?.isPinned).toBe(true);
    expect(fast?.model?.modelId).toBe('openai/luna');
    expect(fast?.isPinned).toBe(false);

    act(() => {
      result.current.setCurrentWorkspace({
        ...mockCurrentWorkspace,
        isAutoModelSelectionEnabled: true,
        aiModelIdByTier: { smart: 'anthropic/opus' },
      });
    });

    expect(
      result.current.tiers.find((tier) => tier.tier === 'smart')?.model
        ?.modelId,
    ).toBe('openai/sol');
  });
});
