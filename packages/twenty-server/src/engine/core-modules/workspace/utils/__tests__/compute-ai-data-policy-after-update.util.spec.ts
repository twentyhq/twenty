import { computeAiDataPolicyAfterUpdate } from 'src/engine/core-modules/workspace/utils/compute-ai-data-policy-after-update.util';

describe('computeAiDataPolicyAfterUpdate', () => {
  it('should keep the stored policy for fields absent from the update', () => {
    expect(
      computeAiDataPolicyAfterUpdate({
        aiDataPolicy: {
          aiDataResidency: 'eu',
          isAiZeroDataRetentionRequired: true,
        },
        update: {},
      }),
    ).toEqual({
      aiDataResidency: 'eu',
      isAiZeroDataRetentionRequired: true,
    });
  });

  it('should lift a residency restriction with an explicit null', () => {
    expect(
      computeAiDataPolicyAfterUpdate({
        aiDataPolicy: {
          aiDataResidency: 'eu',
          isAiZeroDataRetentionRequired: true,
        },
        update: { aiDataResidency: null, isAiZeroDataRetentionRequired: false },
      }),
    ).toEqual({
      aiDataResidency: null,
      isAiZeroDataRetentionRequired: false,
    });
  });
});
