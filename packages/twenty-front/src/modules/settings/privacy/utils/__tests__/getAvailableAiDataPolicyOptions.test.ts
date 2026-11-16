import { getAvailableAiDataPolicyOptions } from '@/settings/privacy/utils/getAvailableAiDataPolicyOptions';

const NO_POLICY = {
  requiredDataResidencyRegion: null,
  isZeroDataRetentionRequired: false,
};

describe('getAvailableAiDataPolicyOptions', () => {
  it('offers nothing when no model states a residency or retention', () => {
    expect(
      getAvailableAiDataPolicyOptions({
        aiModels: [{ dataResidency: null, zeroDataRetention: null }],
        aiDataPolicy: NO_POLICY,
      }),
    ).toEqual({
      dataResidencyRegions: [],
      isZeroDataRetentionAvailable: false,
    });
  });

  it('offers what the served models can satisfy', () => {
    expect(
      getAvailableAiDataPolicyOptions({
        aiModels: [{ dataResidency: 'de', zeroDataRetention: true }],
        aiDataPolicy: NO_POLICY,
      }),
    ).toEqual({
      dataResidencyRegions: ['eu'],
      isZeroDataRetentionAvailable: true,
    });
  });

  it('keeps a restriction in force listed so it can be lifted', () => {
    expect(
      getAvailableAiDataPolicyOptions({
        aiModels: [],
        aiDataPolicy: {
          requiredDataResidencyRegion: 'eu',
          isZeroDataRetentionRequired: true,
        },
      }),
    ).toEqual({
      dataResidencyRegions: ['eu'],
      isZeroDataRetentionAvailable: true,
    });
  });
});
