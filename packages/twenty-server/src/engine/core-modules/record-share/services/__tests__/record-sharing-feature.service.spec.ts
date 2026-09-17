/* @license Enterprise */

import { Test, type TestingModule } from '@nestjs/testing';
import { DiscoveryService } from '@nestjs/core';

import { FeatureFlagKey } from 'twenty-shared/types';

import { RecordSharingEntitlementProvider } from 'src/engine/core-modules/record-share/interfaces/record-sharing-entitlement-provider.service';
import { RecordSharingFeatureService } from 'src/engine/core-modules/record-share/services/record-sharing-feature.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = 'workspace-id';

class TestRecordSharingEntitlementProvider extends RecordSharingEntitlementProvider {
  hasRecordSharingEntitlement = jest.fn();
}

describe('RecordSharingFeatureService', () => {
  let service: RecordSharingFeatureService;

  const entitlementProvider = new TestRecordSharingEntitlementProvider();
  const workspaceCacheService = { getOrRecompute: jest.fn() };
  const discoveryService = { getProviders: jest.fn() };

  const givenFeatureFlag = (value: boolean) =>
    workspaceCacheService.getOrRecompute.mockResolvedValue({
      featureFlagsMap: { [FeatureFlagKey.IS_RECORD_SHARING_ENABLED]: value },
    });

  const givenRegisteredProviders = (
    instances: (RecordSharingEntitlementProvider | undefined)[],
  ) =>
    discoveryService.getProviders.mockReturnValue(
      instances.map((instance) => ({ instance })),
    );

  const buildService = async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordSharingFeatureService,
        { provide: DiscoveryService, useValue: discoveryService },
        { provide: WorkspaceCacheService, useValue: workspaceCacheService },
      ],
    }).compile();

    const builtService = module.get(RecordSharingFeatureService);

    builtService.onModuleInit();

    return builtService;
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    givenRegisteredProviders([entitlementProvider]);
    entitlementProvider.hasRecordSharingEntitlement.mockResolvedValue(true);
    givenFeatureFlag(true);
    service = await buildService();
  });

  it('enables record sharing when the flag is on and the workspace is entitled', async () => {
    expect(await service.isRecordSharingEnabled(WORKSPACE_ID)).toBe(true);
    expect(
      entitlementProvider.hasRecordSharingEntitlement,
    ).toHaveBeenCalledWith(WORKSPACE_ID);
  });

  it('disables record sharing when the workspace is not entitled', async () => {
    entitlementProvider.hasRecordSharingEntitlement.mockResolvedValue(false);

    expect(await service.isRecordSharingEnabled(WORKSPACE_ID)).toBe(false);
  });

  it('disables record sharing when the flag is off, without asking for the entitlement', async () => {
    givenFeatureFlag(false);

    expect(await service.isRecordSharingEnabled(WORKSPACE_ID)).toBe(false);
    expect(
      entitlementProvider.hasRecordSharingEntitlement,
    ).not.toHaveBeenCalled();
  });

  it('stays off when no entitlement provider is registered', async () => {
    givenRegisteredProviders([undefined]);
    service = await buildService();

    expect(await service.isRecordSharingEnabled(WORKSPACE_ID)).toBe(false);
  });
});
