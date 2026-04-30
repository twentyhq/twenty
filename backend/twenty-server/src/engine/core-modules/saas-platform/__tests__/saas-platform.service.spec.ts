import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

import { SaaSPlatformService } from '../saas-platform.service';
import {
  TenantConfigEntity,
  TenantModuleEntity,
  ModuleCatalogEntity,
  FiscalConfigEntity,
  EventLogEntity,
  TenantStatus,
  SubscriptionPlan,
  CountryCode,
} from '../saas-platform.entity';

describe('SaaSPlatformService', () => {
  let service: SaaSPlatformService;

  const mockTenantRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'tenant-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
    update: jest.fn(),
  };

  const mockModuleRepo = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'mod-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  const mockCatalogRepo = {
    find: jest.fn(),
    findOne: jest.fn().mockResolvedValue(null),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'cat-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  const mockFiscalRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'fiscal-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  const mockEventRepo = {
    find: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'evt-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaaSPlatformService,
        { provide: getRepositoryToken(TenantConfigEntity), useValue: mockTenantRepo },
        { provide: getRepositoryToken(TenantModuleEntity), useValue: mockModuleRepo },
        { provide: getRepositoryToken(ModuleCatalogEntity), useValue: mockCatalogRepo },
        { provide: getRepositoryToken(FiscalConfigEntity), useValue: mockFiscalRepo },
        { provide: getRepositoryToken(EventLogEntity), useValue: mockEventRepo },
      ],
    }).compile();

    service = module.get(SaaSPlatformService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('provisionTenant', () => {
    it('should create a new tenant with trial status', async () => {
      mockTenantRepo.findOne.mockResolvedValue(null);
      mockModuleRepo.findOne.mockResolvedValue(null);

      const result = await service.provisionTenant('ws-1', {
        companyName: 'TestCo',
        country: CountryCode.CO,
        plan: SubscriptionPlan.STARTER,
      });

      expect(result).toHaveProperty('companyName', 'TestCo');
      expect(result.status).toBe(TenantStatus.TRIAL);
      expect(result.currency).toBe('COP');
    });

    it('should return existing tenant if already provisioned', async () => {
      const existing = { id: 'tenant-1', workspaceId: 'ws-1' };
      mockTenantRepo.findOne.mockResolvedValue(existing);

      const result = await service.provisionTenant('ws-1', {
        companyName: 'TestCo',
        country: CountryCode.CO,
      });

      expect(result).toEqual(existing);
      expect(mockTenantRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('activateModule', () => {
    it('should activate a module', async () => {
      mockModuleRepo.findOne.mockResolvedValue(null);
      mockCatalogRepo.findOne.mockResolvedValue(null);

      const result = await service.activateModule('ws-1', 'inventory');

      expect(result.isActive).toBe(true);
      expect(result.moduleCode).toBe('inventory');
    });

    it('should return existing active module without re-activating', async () => {
      const existing = { id: 'mod-1', isActive: true, moduleCode: 'inventory' };
      mockModuleRepo.findOne.mockResolvedValue(existing);

      const result = await service.activateModule('ws-1', 'inventory');

      expect(result).toEqual(existing);
    });

    it('should throw ForbiddenException when dependency not met', async () => {
      mockModuleRepo.findOne
        .mockResolvedValueOnce(null) // module itself
        .mockResolvedValueOnce(null); // dependency check fails
      mockCatalogRepo.findOne.mockResolvedValue({
        requiredModules: ['accounts_receivable'],
      });

      await expect(
        service.activateModule('ws-1', 'fintech'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deactivateModule', () => {
    it('should deactivate a module', async () => {
      mockModuleRepo.findOne.mockResolvedValue({
        id: 'mod-1',
        isActive: true,
        moduleCode: 'inventory',
      });
      mockModuleRepo.find.mockResolvedValue([]);

      const result = await service.deactivateModule('ws-1', 'inventory');

      expect(result.isActive).toBe(false);
    });

    it('should throw NotFoundException for non-existent module', async () => {
      mockModuleRepo.findOne.mockResolvedValue(null);

      await expect(
        service.deactivateModule('ws-1', 'bad-module'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('calculateMonthlyInvoice', () => {
    it('should calculate invoice with line items', async () => {
      mockTenantRepo.findOne.mockResolvedValue({
        workspaceId: 'ws-1',
        country: CountryCode.CO,
        currency: 'COP',
        usage: { currentUsers: 5, storageUsedGB: 10, callMinutesUsed: 0, employees: 0 },
      });

      mockModuleRepo.find.mockResolvedValue([
        { moduleCode: 'support_ticket', billingType: 'per_user', priceUSD: 10 },
      ]);

      const result = await service.calculateMonthlyInvoice('ws-1');

      expect(result.subtotalUSD).toBe(50);
      expect(result.taxRate).toBe(0.19);
      expect(result.lineItems).toHaveLength(1);
      expect(result.currency).toBe('COP');
    });
  });
});
