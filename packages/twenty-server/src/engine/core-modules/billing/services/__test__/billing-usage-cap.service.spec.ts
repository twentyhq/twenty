/* @license Enterprise */

import { Test, type TestingModule } from '@nestjs/testing';

import { getRepositoryToken } from '@nestjs/typeorm';

import { Not } from 'typeorm';

import { BillingException } from 'src/engine/core-modules/billing/billing.exception';
import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingUsageCapService } from 'src/engine/core-modules/billing/services/billing-usage-cap.service';

const workspaceId = 'ws_123';

describe('BillingUsageCapService', () => {
  let service: BillingUsageCapService;
  let billingSubscriptionItemRepository: jest.Mocked<{
    find: jest.Mock;
    update: jest.Mock;
  }>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingUsageCapService,
        {
          provide: getRepositoryToken(BillingSubscriptionItemEntity),
          useValue: {
            find: jest.fn().mockResolvedValue([{ id: 'item_1' }]),
            update: jest.fn().mockResolvedValue({ affected: 1 }),
          },
        },
      ],
    }).compile();

    service = module.get<BillingUsageCapService>(BillingUsageCapService);
    billingSubscriptionItemRepository = module.get(
      getRepositoryToken(BillingSubscriptionItemEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setSubscriptionItemHasReachedCap', () => {
    it('flags the resource credit item', async () => {
      await service.setSubscriptionItemHasReachedCap(workspaceId, true);

      expect(billingSubscriptionItemRepository.update).toHaveBeenCalledWith(
        { id: 'item_1' },
        { hasReachedCurrentPeriodCap: true },
      );
    });

    it("looks only at the workspace's non-canceled resource credit items", async () => {
      await service.setSubscriptionItemHasReachedCap(workspaceId, true);

      expect(billingSubscriptionItemRepository.find).toHaveBeenCalledWith({
        where: {
          billingSubscription: {
            workspaceId,
            status: Not(SubscriptionStatus.Canceled),
          },
          billingProduct: { metadata: expect.anything() },
        },
      });
    });

    it('throws when the workspace has no resource credit item', async () => {
      billingSubscriptionItemRepository.find.mockResolvedValue([]);

      await expect(
        service.setSubscriptionItemHasReachedCap(workspaceId, true),
      ).rejects.toThrow(BillingException);
    });

    it('throws when the workspace has more than one resource credit item', async () => {
      billingSubscriptionItemRepository.find.mockResolvedValue([
        { id: 'item_1' },
        { id: 'item_2' },
      ]);

      await expect(
        service.setSubscriptionItemHasReachedCap(workspaceId, true),
      ).rejects.toThrow(BillingException);
    });
  });

  describe('clearHasReachedCapForWorkspace', () => {
    it('clears the flag on every resource credit item', async () => {
      billingSubscriptionItemRepository.find.mockResolvedValue([
        { id: 'item_1' },
        { id: 'item_2' },
      ]);

      await service.clearHasReachedCapForWorkspace(workspaceId);

      expect(billingSubscriptionItemRepository.update).toHaveBeenCalledWith(
        { id: expect.objectContaining({ _value: ['item_1', 'item_2'] }) },
        { hasReachedCurrentPeriodCap: false },
      );
    });

    it('does nothing rather than throwing when there is no item to clear', async () => {
      billingSubscriptionItemRepository.find.mockResolvedValue([]);

      await expect(
        service.clearHasReachedCapForWorkspace(workspaceId),
      ).resolves.not.toThrow();

      expect(billingSubscriptionItemRepository.update).not.toHaveBeenCalled();
    });
  });
});
