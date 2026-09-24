/* @license Enterprise */

import { Test } from '@nestjs/testing';
import { DiscoveryService } from '@nestjs/core';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability } from 'twenty-shared/types';
import { RecordSharingEntitlementProvider } from 'src/engine/core-modules/record-share/interfaces/record-sharing-entitlement-provider.service';
import { RecordSharingFeatureService } from 'src/engine/core-modules/record-share/services/record-sharing-feature.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

class TestEntitlementProvider extends RecordSharingEntitlementProvider {
  hasRecordSharingEntitlement = jest.fn<Promise<boolean>, [string]>();
}

const setup = async ({
  readability = MetadataReadability.SYSTEM,
  flag = true,
  entitled = false,
}: {
  readability?: MetadataReadability;
  flag?: boolean;
  entitled?: boolean;
} = {}) => {
  const provider = new TestEntitlementProvider();
  provider.hasRecordSharingEntitlement.mockResolvedValue(entitled);
  const module = await Test.createTestingModule({
    providers: [
      RecordSharingFeatureService,
      {
        provide: DiscoveryService,
        useValue: { getProviders: () => [{ instance: provider }] },
      },
      {
        provide: WorkspaceCacheService,
        useValue: {
          getOrRecompute: jest.fn().mockResolvedValue({
            flatObjectMetadataMaps: {
              byUniversalIdentifier: {
                [STANDARD_OBJECTS.agentChatThread.universalIdentifier]: {
                  readability,
                },
              },
            },
            featureFlagsMap: { IS_RECORD_SHARING_ENABLED: flag },
            billingEntitlements: {},
          }),
        },
      },
    ],
  }).compile();
  await module.init();
  return { module, provider, service: module.get(RecordSharingFeatureService) };
};

describe('record-sharing rollout entitlement compatibility', () => {
  it('honors an effective self-hosted entitlement even with an empty billing cache', async () => {
    const { module, provider, service } = await setup({ entitled: true });
    expect(await service.isLegacyRecordAccessOpen('workspace')).toBe(false);
    expect(provider.hasRecordSharingEntitlement).toHaveBeenCalledWith(
      'workspace',
    );
    await module.close();
  });

  it('preserves legacy access when sharing was not entitled', async () => {
    const { module, service } = await setup();
    expect(await service.isLegacyRecordAccessOpen('workspace')).toBe(true);
    await module.close();
  });

  it('does not consult entitlement once metadata has been activated', async () => {
    const { module, provider, service } = await setup({
      readability: MetadataReadability.PRIVATE,
      flag: false,
    });
    expect(await service.isLegacyRecordAccessOpen('workspace')).toBe(false);
    expect(provider.hasRecordSharingEntitlement).not.toHaveBeenCalled();
    await module.close();
  });

  it('keeps the legacy-open policy when the feature flag is off', async () => {
    const { module, provider, service } = await setup({
      flag: false,
      entitled: true,
    });
    expect(await service.isLegacyRecordAccessOpen('workspace')).toBe(true);
    expect(provider.hasRecordSharingEntitlement).not.toHaveBeenCalled();
    await module.close();
  });

  it.each([true, false])(
    'allows basic sharing with flag=%s without an entitlement',
    async (flag) => {
      const { module, provider, service } = await setup({ flag });
      expect(await service.isRecordSharingEnabled('workspace')).toBe(flag);
      expect(provider.hasRecordSharingEntitlement).not.toHaveBeenCalled();
      await module.close();
    },
  );
});
