import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

import { TradeImportService } from '../trade-import.service';
import {
  PurchaseOrderEntity,
  ShipmentEntity,
  CustomsEntryEntity,
  LandedCostEntity,
  PurchaseOrderStatus,
  ShipmentStatus,
} from '../trade-import.entity';

describe('TradeImportService', () => {
  let service: TradeImportService;

  const mockPoRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'po-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
    count: jest.fn(),
    update: jest.fn(),
  };

  const mockShipmentRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'ship-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
    createQueryBuilder: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    }),
  };

  const mockCustomsRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'customs-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  const mockLandedCostRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'lc-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TradeImportService,
        { provide: getRepositoryToken(PurchaseOrderEntity), useValue: mockPoRepo },
        { provide: getRepositoryToken(ShipmentEntity), useValue: mockShipmentRepo },
        { provide: getRepositoryToken(CustomsEntryEntity), useValue: mockCustomsRepo },
        { provide: getRepositoryToken(LandedCostEntity), useValue: mockLandedCostRepo },
      ],
    }).compile();

    service = module.get(TradeImportService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPO', () => {
    it('should create a PO with sequential number', async () => {
      mockPoRepo.count.mockResolvedValue(5);

      const result = await service.createPO('ws-1', { supplierId: 'sup-1' });

      expect(result.poNumber).toBe('PO-000006');
      expect(mockPoRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ workspaceId: 'ws-1', poNumber: 'PO-000006' }),
      );
    });

    it('should start numbering from PO-000001', async () => {
      mockPoRepo.count.mockResolvedValue(0);

      const result = await service.createPO('ws-1', {});

      expect(result.poNumber).toBe('PO-000001');
    });
  });

  describe('createShipment', () => {
    it('should create a shipment and update PO status to in-transit', async () => {
      const result = await service.createShipment('ws-1', {
        purchaseOrderId: 'po-1', carrier: 'Maersk',
      });

      expect(mockPoRepo.update).toHaveBeenCalledWith('po-1', { status: PurchaseOrderStatus.IN_TRANSIT });
      expect(result).toHaveProperty('id');
    });

    it('should create shipment without PO link', async () => {
      const result = await service.createShipment('ws-1', { carrier: 'DHL' });

      expect(mockPoRepo.update).not.toHaveBeenCalled();
      expect(result).toHaveProperty('id');
    });
  });

  describe('calculateLandedCost', () => {
    it('should sum all cost components and compute unit cost', async () => {
      const result = await service.calculateLandedCost('ws-1', 'po-1', 'prod-1', {
        productValue: 10_000,
        quantity: 100,
        freight: 500,
        insurance: 100,
        duties: 800,
        vat: 300,
        agentFees: 200,
        otherCosts: 100,
      });

      expect(result.totalLandedCost).toBe(12_000);
      expect(result.unitLandedCost).toBe(120);
    });

    it('should handle missing optional costs', async () => {
      const result = await service.calculateLandedCost('ws-1', 'po-1', 'prod-1', {
        productValue: 5000,
        quantity: 50,
      });

      expect(result.totalLandedCost).toBe(5000);
      expect(result.unitLandedCost).toBe(100);
    });
  });

  describe('getTradeAnalytics', () => {
    it('should aggregate PO, shipment, and landed cost data', async () => {
      mockPoRepo.find.mockResolvedValue([{ id: 'po-1' }, { id: 'po-2' }]);
      mockShipmentRepo.find.mockResolvedValue([
        { id: 's1', status: ShipmentStatus.IN_TRANSIT, actualArrival: null, etd: null },
        {
          id: 's2', status: ShipmentStatus.DELIVERED,
          actualArrival: new Date('2026-02-10'), etd: new Date('2026-01-10'),
        },
      ]);
      mockLandedCostRepo.find.mockResolvedValue([
        { totalLandedCost: 10_000, duties: 800 },
        { totalLandedCost: 15_000, duties: 1200 },
      ]);

      const result = await service.getTradeAnalytics('ws-1');

      expect(result.totalPOs).toBe(2);
      expect(result.inTransit).toBe(1);
      expect(result.avgTransitDays).toBe(31);
      expect(result.totalLandedCost).toBe(25_000);
      expect(result.totalDutiesPaid).toBe(2000);
    });

    it('should handle empty data gracefully', async () => {
      mockPoRepo.find.mockResolvedValue([]);
      mockShipmentRepo.find.mockResolvedValue([]);
      mockLandedCostRepo.find.mockResolvedValue([]);

      const result = await service.getTradeAnalytics('ws-1');

      expect(result.totalPOs).toBe(0);
      expect(result.avgTransitDays).toBe(0);
      expect(result.totalLandedCost).toBe(0);
    });
  });
});
