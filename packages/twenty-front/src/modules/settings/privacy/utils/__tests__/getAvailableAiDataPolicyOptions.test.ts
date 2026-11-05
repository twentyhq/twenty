import { getAvailableAiDataPolicyOptions } from '@/settings/privacy/utils/getAvailableAiDataPolicyOptions';

const NO_POLICY = { dataResidency: null, isZeroDataRetentionRequired: false };

describe('getAvailableAiDataPolicyOptions', () => {
  it('offers nothing when no model states a residency or retention', () => {
    expect(
      getAvailableAiDataPolicyOptions({
        aiModels: [{ dataResidency: null, zeroDataRetention: null }],
        aiDataPolicy: NO_POLICY,
      }),
    ).toEqual({ dataResidencies: [], isZeroDataRetentionAvailable: false });
  });

  it('offers what the served models can satisfy', () => {
    expect(
      getAvailableAiDataPolicyOptions({
        aiModels: [{ dataResidency: 'de', zeroDataRetention: true }],
        aiDataPolicy: NO_POLICY,
      }),
    ).toEqual({ dataResidencies: ['eu'], isZeroDataRetentionAvailable: true });
  });

  it('keeps a restriction in force listed so it can be lifted', () => {
    expect(
      getAvailableAiDataPolicyOptions({
        aiModels: [],
        aiDataPolicy: {
          dataResidency: 'eu',
          isZeroDataRetentionRequired: true,
        },
      }),
    ).toEqual({ dataResidencies: ['eu'], isZeroDataRetentionAvailable: true });
  });
});
