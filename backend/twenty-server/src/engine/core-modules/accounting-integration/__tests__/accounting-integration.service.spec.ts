import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { AccountingIntegrationService } from '../accounting-integration.service';
import {
  AccountingConnectionEntity,
  AccountingSyncLogEntity,
  TaxRuleEntity,
  RevenueRecognitionEntity,
  SalesCommissionEntity,
  ChartOfAccountEntity,
  JournalEntryEntity,
  AccountingPeriodEntity,
  AccountType,
  JournalEntryStatus,
  PeriodStatus,
} from '../accounting-integration.entity';

describe('AccountingIntegrationService', () => {
  let service: AccountingIntegrationService;

  const mockConnRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'conn-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  const mockLogRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'log-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  const mockTaxRepo = {
    find: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'tax-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  const mockRevenueRepo = {
    find: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'rev-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  const mockCommissionRepo = {
    find: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'comm-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  const mockChartRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => {
      if (Array.isArray(data)) return Promise.resolve(data.map((d, i) => ({ id: `chart-${i}`, ...d })));
      return Promise.resolve({ id: 'chart-1', ...data });
    }),
    create: jest.fn().mockImplementation((data) => data),
  };

  const mockJournalRepo = {
    find: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'journal-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
    createQueryBuilder: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    }),
  };

  const mockPeriodRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'period-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountingIntegrationService,
        { provide: getRepositoryToken(AccountingConnectionEntity), useValue: mockConnRepo },
        { provide: getRepositoryToken(AccountingSyncLogEntity), useValue: mockLogRepo },
        { provide: getRepositoryToken(TaxRuleEntity), useValue: mockTaxRepo },
        { provide: getRepositoryToken(RevenueRecognitionEntity), useValue: mockRevenueRepo },
        { provide: getRepositoryToken(SalesCommissionEntity), useValue: mockCommissionRepo },
        { provide: getRepositoryToken(ChartOfAccountEntity), useValue: mockChartRepo },
        { provide: getRepositoryToken(JournalEntryEntity), useValue: mockJournalRepo },
        { provide: getRepositoryToken(AccountingPeriodEntity), useValue: mockPeriodRepo },
      ],
    }).compile();

    service = module.get(AccountingIntegrationService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createJournalEntry', () => {
    it('should create a balanced journal entry', async () => {
      mockChartRepo.findOne.mockResolvedValue({ code: '1000', type: AccountType.ASSET, balance: 0 });
      mockPeriodRepo.findOne.mockResolvedValue(null);

      const result = await service.createJournalEntry('ws-1', {
        date: new Date('2026-04-01'),
        description: 'Test entry',
        entries: [
          { accountCode: '1000', debit: 1000, credit: 0 },
          { accountCode: '1000', debit: 0, credit: 1000 },
        ],
      });

      expect(mockJournalRepo.save).toHaveBeenCalled();
      expect(result.status).toBe(JournalEntryStatus.POSTED);
    });

    it('should throw BadRequestException for unbalanced entry', async () => {
      await expect(
        service.createJournalEntry('ws-1', {
          date: new Date(),
          description: 'Unbalanced',
          entries: [
            { accountCode: '1000', debit: 1000, credit: 0 },
            { accountCode: '2000', debit: 0, credit: 500 },
          ],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for non-existent account', async () => {
      mockChartRepo.findOne.mockResolvedValue(null);
      mockPeriodRepo.findOne.mockResolvedValue(null);

      await expect(
        service.createJournalEntry('ws-1', {
          date: new Date(),
          description: 'Test',
          entries: [
            { accountCode: '9999', debit: 100, credit: 0 },
            { accountCode: '9998', debit: 0, credit: 100 },
          ],
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTrialBalance', () => {
    it('should return trial balance with correct structure', async () => {
      mockChartRepo.find.mockResolvedValue([
        { code: '1000', name: 'Cash', type: AccountType.ASSET, isActive: true },
      ]);

      const result = await service.getTrialBalance('ws-1');

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('calculateTax', () => {
    it('should calculate tax and withholding', async () => {
      mockTaxRepo.find.mockResolvedValue([
        { rate: 19, isWithholding: false, withholdingRate: 0 },
        { rate: 0, isWithholding: true, withholdingRate: 4 },
      ]);

      const result = await service.calculateTax('ws-1', 1_000_000, 'CO');

      expect(result.tax).toBe(190_000);
      expect(result.withholding).toBe(40_000);
      expect(result.net).toBe(1_150_000);
    });

    it('should handle no tax rules', async () => {
      mockTaxRepo.find.mockResolvedValue([]);

      const result = await service.calculateTax('ws-1', 1000, 'XX');

      expect(result.tax).toBe(0);
      expect(result.withholding).toBe(0);
      expect(result.net).toBe(1000);
    });
  });
});
