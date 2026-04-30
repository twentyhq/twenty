import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

import { InventoryService } from '../inventory.service';
import {
  ProductStockEntity,
  StockMovementEntity,
  WarehouseEntity,
  SupplierEntity,
} from '../inventory.entity';

describe('InventoryService', () => {
  let service: InventoryService;

  const mockStockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'stock-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
    createQueryBuilder: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    }),
  };

  const mockMovementRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'mov-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
    count: jest.fn().mockResolvedValue(0),
    createQueryBuilder: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    }),
  };

  const mockWarehouseRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'wh-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  const mockSupplierRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'sup-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
    createQueryBuilder: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: getRepositoryToken(ProductStockEntity), useValue: mockStockRepo },
        { provide: getRepositoryToken(StockMovementEntity), useValue: mockMovementRepo },
        { provide: getRepositoryToken(WarehouseEntity), useValue: mockWarehouseRepo },
        { provide: getRepositoryToken(SupplierEntity), useValue: mockSupplierRepo },
      ],
    }).compile();

    service = module.get(InventoryService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addStock', () => {
    it('should create new stock entry when none exists', async () => {
      mockStockRepo.findOne.mockResolvedValue(null);

      const result = await service.addStock('ws-1', 'prod-1', 'wh-1', 10, 500);

      expect(mockStockRepo.create).toHaveBeenCalled();
      expect(mockStockRepo.save).toHaveBeenCalled();
      expect(result.quantityOnHand).toBe(10);
    });

    it('should increment existing stock', async () => {
      mockStockRepo.findOne.mockResolvedValue({
        quantityOnHand: 5,
        quantityAvailable: 5,
        quantityReserved: 0,
      });

      const result = await service.addStock('ws-1', 'prod-1', 'wh-1', 10);

      expect(result.quantityOnHand).toBe(15);
    });
  });

  describe('reserveStock', () => {
    it('should reserve stock when available', async () => {
      mockStockRepo.findOne.mockResolvedValue({
        quantityOnHand: 20,
        quantityAvailable: 15,
        quantityReserved: 5,
      });

      const result = await service.reserveStock('ws-1', 'prod-1', 'wh-1', 10);

      expect(result.quantityReserved).toBe(15);
      expect(result.quantityAvailable).toBe(5);
    });

    it('should throw BadRequestException when insufficient stock', async () => {
      mockStockRepo.findOne.mockResolvedValue({
        quantityOnHand: 5,
        quantityAvailable: 3,
        quantityReserved: 2,
      });

      await expect(
        service.reserveStock('ws-1', 'prod-1', 'wh-1', 10),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when stock does not exist', async () => {
      mockStockRepo.findOne.mockResolvedValue(null);

      await expect(
        service.reserveStock('ws-1', 'prod-1', 'wh-1', 5),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getLowStockAlerts', () => {
    it('should return low stock items via query builder', async () => {
      await service.getLowStockAlerts('ws-1');

      expect(mockStockRepo.createQueryBuilder).toHaveBeenCalledWith('s');
    });
  });

  describe('getStockValuation', () => {
    it('should compute total valuation', async () => {
      mockStockRepo.find.mockResolvedValue([
        { productId: 'p1', quantityOnHand: 10, unitCost: 100 },
        { productId: 'p2', quantityOnHand: 5, unitCost: 200 },
      ]);

      const result = await service.getStockValuation('ws-1');

      expect(result.totalValue).toBe(2000);
      expect(result.items).toHaveLength(2);
      expect(result.items[0].value).toBe(1000);
    });

    it('should return zero for empty stock', async () => {
      mockStockRepo.find.mockResolvedValue([]);

      const result = await service.getStockValuation('ws-1');

      expect(result.totalValue).toBe(0);
      expect(result.items).toHaveLength(0);
    });
  });
});
