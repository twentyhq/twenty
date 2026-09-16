/* @license Enterprise */

import { Test } from '@nestjs/testing';

import { BillingEntitlementEntity } from 'src/engine/core-modules/billing/entities/billing-entitlement.entity';
import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { WorkspaceBillingEntitlementsCacheService } from 'src/engine/core-modules/billing/services/workspace-billing-entitlements-cache.service';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

describe('WorkspaceBillingEntitlementsCacheService', () => {
  const repository = { find: jest.fn() };
  let service: WorkspaceBillingEntitlementsCacheService;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        WorkspaceBillingEntitlementsCacheService,
        {
          provide: getWorkspaceScopedRepositoryToken(BillingEntitlementEntity),
          useValue: repository,
        },
      ],
    }).compile();
    service = module.get(WorkspaceBillingEntitlementsCacheService);
  });

  it('caches only entitlement values for the requested workspace', async () => {
    repository.find.mockResolvedValue([
      { key: BillingEntitlementKey.USAGE_LIMIT, value: true },
      { key: BillingEntitlementKey.RLS, value: false },
    ]);
    expect(
      await service.computeForCache({ workspaceId: WORKSPACE_ID }),
    ).toEqual({
      [BillingEntitlementKey.USAGE_LIMIT]: true,
      [BillingEntitlementKey.RLS]: false,
    });
    expect(repository.find).toHaveBeenCalledWith(WORKSPACE_ID, {
      select: { key: true, value: true },
    });
  });

  it('returns an empty map for a workspace without entitlement rows', async () => {
    repository.find.mockResolvedValue([]);
    expect(
      await service.computeForCache({ workspaceId: WORKSPACE_ID }),
    ).toEqual({});
  });
});
