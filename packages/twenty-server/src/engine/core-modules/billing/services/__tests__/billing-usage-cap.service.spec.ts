import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { In, type Repository } from 'typeorm';

import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingUsageCapService } from 'src/engine/core-modules/billing/services/billing-usage-cap.service';

const WORKSPACE_ID = 'e6a6dd6f-3b0f-4d6e-9a2a-1b6f4a4c1a11';

describe('BillingUsageCapService', () => {
  let service: BillingUsageCapService;
  let billingSubscriptionItemRepository: jest.Mocked<
    Repository<BillingSubscriptionItemEntity>
  >;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingUsageCapService,
        {
          provide: getRepositoryToken(BillingSubscriptionItemEntity),
          useValue: {
            find: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(BillingUsageCapService);
    billingSubscriptionItemRepository = module.get(
      getRepositoryToken(BillingSubscriptionItemEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('markHasReachedCapForWorkspace', () => {
    it('should mark the items that are not already capped and report the change', async () => {
      billingSubscriptionItemRepository.find.mockResolvedValue([
        { id: 'item-1', hasReachedCurrentPeriodCap: false },
      ] as BillingSubscriptionItemEntity[]);

      const hasChanged =
        await service.markHasReachedCapForWorkspace(WORKSPACE_ID);

      expect(hasChanged).toBe(true);
      expect(billingSubscriptionItemRepository.update).toHaveBeenCalledWith(
        { id: In(['item-1']) },
        { hasReachedCurrentPeriodCap: true },
      );
    });

    it('should not write when every item is already capped', async () => {
      billingSubscriptionItemRepository.find.mockResolvedValue([
        { id: 'item-1', hasReachedCurrentPeriodCap: true },
      ] as BillingSubscriptionItemEntity[]);

      const hasChanged =
        await service.markHasReachedCapForWorkspace(WORKSPACE_ID);

      expect(hasChanged).toBe(false);
      expect(billingSubscriptionItemRepository.update).not.toHaveBeenCalled();
    });

    it('should not throw when the workspace has no resource credit item', async () => {
      billingSubscriptionItemRepository.find.mockResolvedValue([]);

      const hasChanged =
        await service.markHasReachedCapForWorkspace(WORKSPACE_ID);

      expect(hasChanged).toBe(false);
      expect(billingSubscriptionItemRepository.update).not.toHaveBeenCalled();
    });
  });
});
