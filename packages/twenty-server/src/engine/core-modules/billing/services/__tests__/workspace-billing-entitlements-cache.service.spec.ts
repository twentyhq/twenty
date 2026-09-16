/* @license Enterprise */

import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { WorkspaceBillingEntitlementsCacheService } from 'src/engine/core-modules/billing/services/workspace-billing-entitlements-cache.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceCacheRowsBatchLoader } from 'src/engine/workspace-cache/services/workspace-cache-rows-batch-loader';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

describe('WorkspaceBillingEntitlementsCacheService', () => {
  let service: WorkspaceBillingEntitlementsCacheService;
  const twentyConfigService = { get: jest.fn() };

  const createService = async (isBillingEnabled: boolean) => {
    twentyConfigService.get.mockReturnValue(isBillingEnabled);
    const module = await Test.createTestingModule({
      providers: [
        WorkspaceBillingEntitlementsCacheService,
        { provide: TwentyConfigService, useValue: twentyConfigService },
      ],
    }).compile();

    return module.get(WorkspaceBillingEntitlementsCacheService);
  };

  beforeEach(async () => {
    service = await createService(true);
  });

  it('preserves both granted and revoked entitlements', () => {
    expect(
      service.computeForCache({
        workspaceId: WORKSPACE_ID,
        rows: {
          billingEntitlement: [
            { key: BillingEntitlementKey.USAGE_LIMIT, value: true },
            { key: BillingEntitlementKey.RLS, value: false },
          ],
        },
      }),
    ).toEqual({
      [BillingEntitlementKey.USAGE_LIMIT]: true,
      [BillingEntitlementKey.RLS]: false,
    });
  });

  it('returns an empty map for a workspace without entitlement rows', () => {
    expect(
      service.computeForCache({
        workspaceId: WORKSPACE_ID,
        rows: { billingEntitlement: [] },
      }),
    ).toEqual({});
  });

  it('loads no rows when billing entities are not registered', async () => {
    service = await createService(false);
    const dataSource = new DataSource({ type: 'postgres', entities: [] });
    const rowsBatchLoader = new WorkspaceCacheRowsBatchLoader(
      dataSource,
      WORKSPACE_ID,
    );

    await rowsBatchLoader.loadRows([service.rowsRequirement]);

    expect(service.rowsRequirement).toEqual({});
    expect(
      service.computeForCache({
        workspaceId: WORKSPACE_ID,
        rows: rowsBatchLoader.readRows(service.rowsRequirement),
      }),
    ).toEqual({});
  });
});
