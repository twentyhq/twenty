import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

import { AccountsReceivableService } from '../accounts-receivable.service';
import {
  InvoiceEntity,
  PaymentEntity,
  DisputeEntity,
  DunningSequenceEntity,
  PaymentPromiseEntity,
  InvoiceStatus,
  PaymentMethod,
} from '../accounts-receivable.entity';

describe('AccountsReceivableService', () => {
  let service: AccountsReceivableService;

  const mockInvoiceRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'inv-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
    count: jest.fn().mockResolvedValue(0),
    update: jest.fn(),
    sum: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ affected: 0 }),
    }),
  };

  const mockPaymentRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'pay-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  const mockDisputeRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'disp-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  const mockDunningRepo = {
    find: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'dun-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  const mockPromiseRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'prom-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsReceivableService,
        { provide: getRepositoryToken(InvoiceEntity), useValue: mockInvoiceRepo },
        { provide: getRepositoryToken(PaymentEntity), useValue: mockPaymentRepo },
        { provide: getRepositoryToken(DisputeEntity), useValue: mockDisputeRepo },
        { provide: getRepositoryToken(DunningSequenceEntity), useValue: mockDunningRepo },
        { provide: getRepositoryToken(PaymentPromiseEntity), useValue: mockPromiseRepo },
      ],
    }).compile();

    service = module.get(AccountsReceivableService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createInvoiceFromDeal', () => {
    it('should create an invoice with computed totals', async () => {
      const result = await service.createInvoiceFromDeal('ws-1', {
        accountId: 'acc-1',
        dealId: 'deal-1',
        lineItems: [
          { description: 'Widget', quantity: 2, unitPrice: 1000, tax: 0.19 },
        ],
      });

      expect(mockInvoiceRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId: 'ws-1',
          accountId: 'acc-1',
          dealId: 'deal-1',
        }),
      );
      expect(mockInvoiceRepo.save).toHaveBeenCalled();
      expect(result.subtotal).toBe(2000);
      expect(result.taxAmount).toBe(380);
      expect(result.totalAmount).toBe(2380);
    });
  });

  describe('applyPayment', () => {
    it('should apply a payment and update invoice balance', async () => {
      mockInvoiceRepo.findOne.mockResolvedValue({
        id: 'inv-1',
        totalAmount: 1000,
        amountPaid: 0,
        balanceDue: 1000,
        status: InvoiceStatus.SENT,
      });
      mockPaymentRepo.findOne.mockResolvedValue(null);

      const result = await service.applyPayment(
        'ws-1',
        'inv-1',
        1000,
        PaymentMethod.BANK_TRANSFER,
      );

      expect(result).toHaveProperty('amount', 1000);
      expect(mockInvoiceRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: InvoiceStatus.PAID }),
      );
    });

    it('should throw NotFoundException for non-existent invoice', async () => {
      mockInvoiceRepo.findOne.mockResolvedValue(null);

      await expect(
        service.applyPayment('ws-1', 'bad-id', 500, PaymentMethod.CASH),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getDSO', () => {
    it('should return 0 when no paid invoices', async () => {
      mockInvoiceRepo.find.mockResolvedValue([]);

      const result = await service.getDSO('ws-1');

      expect(result).toBe(0);
    });

    it('should calculate DSO from paid invoices', async () => {
      const issueDate = new Date('2026-01-01');
      const paidAt = new Date('2026-01-31');

      mockInvoiceRepo.find.mockResolvedValue([
        { issueDate, paidAt, totalAmount: 1000 },
      ]);

      const result = await service.getDSO('ws-1');

      expect(typeof result).toBe('number');
      expect(result).toBe(30);
    });
  });

  describe('getAgingReport', () => {
    it('should return aging buckets with correct structure', async () => {
      mockInvoiceRepo.find.mockResolvedValue([]);

      const result = await service.getAgingReport('ws-1');

      expect(result).toHaveProperty('current');
      expect(result).toHaveProperty('1-30');
      expect(result).toHaveProperty('31-60');
      expect(result).toHaveProperty('61-90');
      expect(result).toHaveProperty('90+');
      expect(result['current']).toEqual({ count: 0, total: 0 });
    });
  });
});
