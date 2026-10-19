import { getAvailableAiDataPolicyOptions } from '@/settings/privacy/utils/getAvailableAiDataPolicyOptions';

const WORLDWIDE = {
  aiDataResidency: null,
  isAiZeroDataRetentionRequired: false,
};

describe('getAvailableAiDataPolicyOptions', () => {
  it('offers nothing when no model states a residency or retention', () => {
    expect(
      getAvailableAiDataPolicyOptions({
        aiModels: [{}, { dataResidency: null }],
        aiDataPolicy: WORLDWIDE,
      }),
    ).toEqual({ aiDataResidencies: [], isZeroDataRetentionAvailable: false });
  });

  it('offers EU only when an EU model is served', () => {
    expect(
      getAvailableAiDataPolicyOptions({
        aiModels: [
          { dataResidency: 'us', zeroDataRetention: true },
          { dataResidency: 'de' },
        ],
        aiDataPolicy: WORLDWIDE,
      }),
    ).toEqual({
      aiDataResidencies: ['eu'],
      isZeroDataRetentionAvailable: true,
    });
  });

  it('keeps a restriction in force listed after its last model is gone, so it can be lifted', () => {
    expect(
      getAvailableAiDataPolicyOptions({
        aiModels: [{ dataResidency: 'us' }],
        aiDataPolicy: {
          aiDataResidency: 'eu',
          isAiZeroDataRetentionRequired: true,
        },
      }),
    ).toEqual({
      aiDataResidencies: ['eu'],
      isZeroDataRetentionAvailable: true,
    });
  });
});
