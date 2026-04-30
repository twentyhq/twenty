import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

import { ContractLifecycleService } from '../contract-lifecycle.service';
import {
  CLMContractEntity,
  CLMTemplateEntity,
  ContractStatus,
} from '../contract-lifecycle.entity';

describe('ContractLifecycleService', () => {
  let service: ContractLifecycleService;

  const mockContractRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'contract-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
    count: jest.fn(),
    update: jest.fn(),
  };

  const mockTemplateRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'template-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractLifecycleService,
        { provide: getRepositoryToken(CLMContractEntity), useValue: mockContractRepo },
        { provide: getRepositoryToken(CLMTemplateEntity), useValue: mockTemplateRepo },
      ],
    }).compile();

    service = module.get(ContractLifecycleService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFromDeal', () => {
    it('should create a contract from a template with variable substitution', async () => {
      mockTemplateRepo.findOne.mockResolvedValue({
        id: 'tpl-1',
        content: 'Contract for {{companyName}}',
        variables: ['companyName'],
      });

      const result = await service.createFromDeal('ws-1', 'deal-1', 'tpl-1', {
        companyName: 'Acme Corp',
      } as Partial<CLMContractEntity>);

      expect(mockContractRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ workspaceId: 'ws-1', dealId: 'deal-1' }),
      );
      expect(mockContractRepo.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
    });

    it('should handle missing template gracefully', async () => {
      mockTemplateRepo.findOne.mockResolvedValue(null);

      const result = await service.createFromDeal('ws-1', 'deal-1', 'missing', {});

      expect(mockContractRepo.save).toHaveBeenCalled();
      expect(result).toHaveProperty('content', '');
    });
  });

  describe('signContract', () => {
    it('should sign contract and set status to ACTIVE', async () => {
      mockContractRepo.findOne.mockResolvedValue({
        id: 'contract-1',
        status: ContractStatus.PENDING_SIGNATURE,
        signatureAudit: [],
      });

      const result = await service.signContract('contract-1', 'signer-1', '127.0.0.1');

      expect(result.status).toBe(ContractStatus.ACTIVE);
      expect(result.signatureAudit).toHaveLength(1);
      expect(result.signatureAudit[0]).toHaveProperty('signerId', 'signer-1');
      expect(result.signatureAudit[0]).toHaveProperty('ip', '127.0.0.1');
    });

    it('should throw NotFoundException for non-existent contract', async () => {
      mockContractRepo.findOne.mockResolvedValue(null);

      await expect(service.signContract('bad-id', 'signer-1', '127.0.0.1'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('scoreRisk', () => {
    it('should score risk with flags for high-value auto-renew contract', async () => {
      mockContractRepo.findOne.mockResolvedValue({
        id: 'contract-1',
        autoRenew: true,
        slas: [{ penalty: true }],
        noticePeriodDays: 15,
        totalValue: 600_000_000,
      });

      const result = await service.scoreRisk('contract-1');

      expect(result.score).toBe(60);
      expect(result.flags).toContain('auto_renew_risk');
      expect(result.flags).toContain('penalty_clauses');
      expect(result.flags).toContain('short_notice_period');
      expect(result.flags).toContain('high_value');
    });

    it('should return zero score for low-risk contract', async () => {
      mockContractRepo.findOne.mockResolvedValue({
        id: 'contract-1',
        autoRenew: false,
        slas: [],
        noticePeriodDays: 60,
        totalValue: 100_000,
      });

      const result = await service.scoreRisk('contract-1');

      expect(result.score).toBe(0);
      expect(result.flags).toHaveLength(0);
    });
  });

  describe('getExpiringContracts', () => {
    it('should return active contracts expiring within given days', async () => {
      const expiring = [
        { id: 'c-1', endDate: new Date(Date.now() + 10 * 86_400_000) },
      ];
      mockContractRepo.find.mockResolvedValue(expiring);

      const result = await service.getExpiringContracts('ws-1', 30);

      expect(mockContractRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ workspaceId: 'ws-1', status: ContractStatus.ACTIVE }),
        }),
      );
      expect(result).toEqual(expiring);
    });
  });

  describe('trackObligation', () => {
    it('should add an obligation to a contract', async () => {
      mockContractRepo.findOne.mockResolvedValue({
        id: 'contract-1',
        obligations: [],
      });

      const result = await service.trackObligation(
        'contract-1', 'NDA clause', 'legal-team', '2026-06-01',
      );

      expect(result.obligations).toHaveLength(1);
      expect(result.obligations[0]).toEqual(
        expect.objectContaining({ clause: 'NDA clause', responsible: 'legal-team', completed: false }),
      );
    });

    it('should throw NotFoundException for non-existent contract', async () => {
      mockContractRepo.findOne.mockResolvedValue(null);

      await expect(service.trackObligation('bad-id', 'clause', 'user', '2026-06-01'))
        .rejects.toThrow(NotFoundException);
    });
  });
});
