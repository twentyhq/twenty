import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

import { ProcurementService } from '../procurement.service';
import {
  PurchaseRequestEntity,
  RFQEntity,
  VendorScorecardEntity,
  PRStatus,
} from '../procurement.entity';

describe('ProcurementService', () => {
  let service: ProcurementService;

  const mockPrRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'pr-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
    count: jest.fn(),
  };

  const mockRfqRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'rfq-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  const mockScorecardRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'sc-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcurementService,
        { provide: getRepositoryToken(PurchaseRequestEntity), useValue: mockPrRepo },
        { provide: getRepositoryToken(RFQEntity), useValue: mockRfqRepo },
        { provide: getRepositoryToken(VendorScorecardEntity), useValue: mockScorecardRepo },
      ],
    }).compile();

    service = module.get(ProcurementService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPR', () => {
    it('should create a PR and calculate total from items', async () => {
      const result = await service.createPR('ws-1', {
        items: [
          { description: 'Widget', quantity: 10, unitPrice: 50 },
          { description: 'Gadget', quantity: 5, unitPrice: 100 },
        ],
      } as Partial<PurchaseRequestEntity>);

      expect(mockPrRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ workspaceId: 'ws-1', estimatedAmount: 1000 }),
      );
      expect(result).toHaveProperty('id');
    });

    it('should default to zero when no items provided', async () => {
      await service.createPR('ws-1', {});

      expect(mockPrRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ estimatedAmount: 0 }),
      );
    });
  });

  describe('approvePR', () => {
    it('should approve a PR and set approver', async () => {
      mockPrRepo.findOne.mockResolvedValue({ id: 'pr-1', status: PRStatus.DRAFT });

      const result = await service.approvePR('pr-1', 'approver-1');

      expect(result.status).toBe(PRStatus.APPROVED);
      expect(result.approverId).toBe('approver-1');
    });

    it('should throw NotFoundException for non-existent PR', async () => {
      mockPrRepo.findOne.mockResolvedValue(null);

      await expect(service.approvePR('bad-id', 'approver-1'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('threeWayMatch', () => {
    it('should match when amounts and quantities align', async () => {
      mockPrRepo.findOne.mockResolvedValue({
        id: 'pr-1', estimatedAmount: 1000,
        items: [{ quantity: 10 }, { quantity: 5 }],
      });

      const result = await service.threeWayMatch('ws-1', 'pr-1', 1000, 15);

      expect(result.matched).toBe(true);
      expect(result.discrepancies).toHaveLength(0);
    });

    it('should detect discrepancies in amount and quantity', async () => {
      mockPrRepo.findOne.mockResolvedValue({
        id: 'pr-1', estimatedAmount: 1000,
        items: [{ quantity: 10 }],
      });

      const result = await service.threeWayMatch('ws-1', 'pr-1', 1200, 8);

      expect(result.matched).toBe(false);
      expect(result.discrepancies).toHaveLength(2);
    });

    it('should throw NotFoundException for missing PR', async () => {
      mockPrRepo.findOne.mockResolvedValue(null);

      await expect(service.threeWayMatch('ws-1', 'bad-id', 100, 10))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('detectDuplicateSpend', () => {
    it('should detect duplicate items across PRs from different requesters', async () => {
      mockPrRepo.find.mockResolvedValue([
        { id: 'pr-1', requesterId: 'user-1', category: 'office', items: [{ description: 'Laptop Stand', quantity: 5, unitPrice: 30 }] },
        { id: 'pr-2', requesterId: 'user-2', category: 'office', items: [{ description: 'laptop stand', quantity: 3, unitPrice: 35 }] },
      ]);

      const result = await service.detectDuplicateSpend('ws-1');

      expect(result).toHaveLength(1);
      expect(result[0].matchingPRs).toHaveLength(2);
    });

    it('should not flag items from the same requester', async () => {
      mockPrRepo.find.mockResolvedValue([
        { id: 'pr-1', requesterId: 'user-1', items: [{ description: 'Mouse', quantity: 1, unitPrice: 20 }] },
        { id: 'pr-2', requesterId: 'user-1', items: [{ description: 'Mouse', quantity: 2, unitPrice: 20 }] },
      ]);

      const result = await service.detectDuplicateSpend('ws-1');

      expect(result).toHaveLength(0);
    });
  });
});
