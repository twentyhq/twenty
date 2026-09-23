import { FeatureFlagKey } from 'twenty-shared/types';

import { RecordSharingFeatureService } from 'src/engine/core-modules/record-share/services/record-sharing-feature.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { Test } from '@nestjs/testing';

describe('RecordSharingFeatureService', () => {
  it.each([true, false, undefined])(
    'requires an explicitly enabled rollout flag (%s), without a license provider',
    async (flag) => {
      const module = await Test.createTestingModule({
        providers: [
          RecordSharingFeatureService,
          {
            provide: WorkspaceCacheService,
            useValue: {
              getOrRecompute: jest.fn().mockResolvedValue({
                featureFlagsMap: {
                  [FeatureFlagKey.IS_RECORD_SHARING_ENABLED]: flag,
                },
              }),
            },
          },
        ],
      }).compile();
      expect(
        await module
          .get(RecordSharingFeatureService)
          .isRecordSharingEnabled('workspace'),
      ).toBe(flag === true);
      await module.close();
    },
  );
});
