import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

import { ECommerceService } from '../ecommerce.service';
import {
  ECommerceProductEntity,
  ECommerceOrderEntity,
  AbandonedCartEntity,
  ECommerceSubscriptionEntity,
  LoyaltyMemberEntity,
  BrowseEventEntity,
  ProductReviewEntity,
  CartStatus,
} from '../ecommerce.entity';

describe('ECommerceService', () => {
  let service: ECommerceService;

  const mockProductRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'prod-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
    increment: jest.fn(),
  };

  const mockOrderRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'ord-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
    count: jest.fn().mockResolvedValue(0),
  };

  const mockCartRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'cart-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
    update: jest.fn(),
  };

  const mockSubRepo = {
    find: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'sub-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  const mockLoyaltyRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'loy-1', ...data })),
    create: jest.fn().mockImplementation((data) => ({
      totalPoints: 0,
      availablePoints: 0,
      totalOrders: 0,
      lifetimeValue: 0,
      avgOrderValue: 0,
      daysSinceLastOrder: 0,
      repurchaseRate: 0,
      predictedCLV: 0,
      redeemedPoints: 0,
      createdAt: new Date(),
      ...data,
    })),
    count: jest.fn().mockResolvedValue(0),
  };

  const mockBrowseRepo = {
    find: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'browse-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  const mockReviewRepo = {
    find: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'review-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ECommerceService,
        { provide: getRepositoryToken(ECommerceProductEntity), useValue: mockProductRepo },
        { provide: getRepositoryToken(ECommerceOrderEntity), useValue: mockOrderRepo },
        { provide: getRepositoryToken(AbandonedCartEntity), useValue: mockCartRepo },
        { provide: getRepositoryToken(ECommerceSubscriptionEntity), useValue: mockSubRepo },
        { provide: getRepositoryToken(LoyaltyMemberEntity), useValue: mockLoyaltyRepo },
        { provide: getRepositoryToken(BrowseEventEntity), useValue: mockBrowseRepo },
        { provide: getRepositoryToken(ProductReviewEntity), useValue: mockReviewRepo },
      ],
    }).compile();

    service = module.get(ECommerceService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProduct', () => {
    it('should create a product', async () => {
      const result = await service.createProduct('ws-1', {
        name: 'Widget',
        basePrice: 50000,
      } as Partial<ECommerceProductEntity>);

      expect(mockProductRepo.create).toHaveBeenCalled();
      expect(result).toHaveProperty('name', 'Widget');
    });
  });

  describe('createOrder', () => {
    it('should create an order with computed totals', async () => {
      mockLoyaltyRepo.findOne.mockResolvedValue(null);

      const result = await service.createOrder('ws-1', {
        items: [
          { productId: 'p1', name: 'Widget', sku: 'W1', quantity: 2, unitPrice: 1000, discount: 0, total: 2000 },
        ],
        taxAmount: 380,
        shippingCost: 100,
      });

      expect(mockOrderRepo.save).toHaveBeenCalled();
      expect(result.subtotal).toBe(2000);
      expect(result.totalAmount).toBe(2480);
    });
  });

  describe('trackAbandonedCart', () => {
    it('should create an abandoned cart entry', async () => {
      const result = await service.trackAbandonedCart('ws-1', {
        contactId: 'c-1',
        cartValue: 50000,
        items: [],
      });

      expect(result.status).toBe(CartStatus.ABANDONED);
      expect(result.abandonedAt).toBeInstanceOf(Date);
    });
  });

  describe('getDynamicPrice', () => {
    it('should return base price when no segment', async () => {
      mockProductRepo.findOne.mockResolvedValue({
        id: 'prod-1',
        basePrice: 10000,
      });

      const result = await service.getDynamicPrice('prod-1');

      expect(result).toBe(10000);
    });

    it('should throw NotFoundException for non-existent product', async () => {
      mockProductRepo.findOne.mockResolvedValue(null);

      await expect(service.getDynamicPrice('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
