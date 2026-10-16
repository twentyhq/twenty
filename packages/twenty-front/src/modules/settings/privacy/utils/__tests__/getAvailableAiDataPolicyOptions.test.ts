import { getAvailableAiDataPolicyOptions } from '@/settings/privacy/utils/getAvailableAiDataPolicyOptions';

describe('getAvailableAiDataPolicyOptions', () => {
  it('offers nothing when no model states a residency or retention', () => {
    expect(
      getAvailableAiDataPolicyOptions([{}, { dataResidency: null }]),
    ).toEqual({ aiDataResidencies: [], isZeroDataRetentionAvailable: false });
  });

  it('offers EU only when an EU model is served', () => {
    expect(
      getAvailableAiDataPolicyOptions([
        { dataResidency: 'us', zeroDataRetention: true },
        { dataResidency: 'de' },
      ]),
    ).toEqual({
      aiDataResidencies: ['eu'],
      isZeroDataRetentionAvailable: true,
    });
  });
});
