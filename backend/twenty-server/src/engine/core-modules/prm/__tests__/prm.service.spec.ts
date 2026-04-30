import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

import { PRMService } from '../prm.service';
import {
  PartnerEntity,
  DealRegistrationEntity,
  MDFRequestEntity,
  PartnerSPIFFEntity,
  PartnerCommunicationEntity,
  PartnerStatus,
  PartnerTier,
  DealRegStatus,
  MDFStatus,
} from '../prm.entity';

describe('PRMService', () => {
  let service: PRMService;

  const mockPartnerRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'partner-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
    increment: jest.fn(),
  };

  const mockDealRegRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'reg-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  const mockMdfRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'mdf-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  const mockSpiffRepo = {
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'spiff-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  const mockCommRepo = {
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'comm-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PRMService,
        { provide: getRepositoryToken(PartnerEntity), useValue: mockPartnerRepo },
        { provide: getRepositoryToken(DealRegistrationEntity), useValue: mockDealRegRepo },
        { provide: getRepositoryToken(MDFRequestEntity), useValue: mockMdfRepo },
        { provide: getRepositoryToken(PartnerSPIFFEntity), useValue: mockSpiffRepo },
        { provide: getRepositoryToken(PartnerCommunicationEntity), useValue: mockCommRepo },
      ],
    }).compile();

    service = module.get(PRMService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recruitPartner', () => {
    it('should create a partner with prospect status', async () => {
      const result = await service.recruitPartner('ws-1', {
        companyName: 'PartnerCo',
        contactName: 'Jane',
      } as Partial<PartnerEntity>);

      expect(result.status).toBe(PartnerStatus.PROSPECT);
      expect(result).toHaveProperty('companyName', 'PartnerCo');
    });
  });

  describe('registerDeal', () => {
    it('should register a deal for a partner', async () => {
      mockDealRegRepo.findOne.mockResolvedValue(null);

      const result = await service.registerDeal('ws-1', 'partner-1', {
        prospectCompanyName: 'ClientCo',
        estimatedValue: 50_000_000,
      });

      expect(mockDealRegRepo.save).toHaveBeenCalled();
      expect(mockPartnerRepo.increment).toHaveBeenCalledWith(
        { id: 'partner-1' },
        'activeDeals',
        1,
      );
      expect(result).toHaveProperty('partnerId', 'partner-1');
    });

    it('should detect conflicts with existing registrations', async () => {
      mockDealRegRepo.findOne.mockResolvedValue({
        id: 'existing-reg',
        partnerId: 'other-partner',
        status: DealRegStatus.APPROVED,
      });

      const result = await service.registerDeal('ws-1', 'partner-1', {
        prospectCompanyName: 'ClientCo',
      });

      expect(result.conflictingPartnerId).toBe('other-partner');
      expect(result.conflictResolution).toBe('pending_review');
    });
  });

  describe('getChannelAnalytics', () => {
    it('should return analytics with correct structure', async () => {
      mockPartnerRepo.find.mockResolvedValue([]);
      mockMdfRepo.find.mockResolvedValue([]);
      mockDealRegRepo.find.mockResolvedValue([]);

      const result = await service.getChannelAnalytics('ws-1');

      expect(result).toHaveProperty('totalPartners', 0);
      expect(result).toHaveProperty('activePartners', 0);
      expect(result).toHaveProperty('channelRevenue', 0);
      expect(result).toHaveProperty('avgDealSize', 0);
      expect(result).toHaveProperty('byTier');
      expect(result).toHaveProperty('topPartners');
    });
  });

  describe('calculateHealthScore', () => {
    it('should compute health score from factors', async () => {
      mockPartnerRepo.findOne.mockResolvedValue({
        id: 'partner-1',
        activeDeals: 3,
        totalRevenue: 50_000_000,
        coursesCompleted: 2,
        points: 50,
        healthScore: 0,
      });

      const result = await service.calculateHealthScore('partner-1');

      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('factors');
      expect(typeof result.score).toBe('number');
      expect(result.score).toBeGreaterThan(0);
    });

    it('should throw NotFoundException for invalid partner', async () => {
      mockPartnerRepo.findOne.mockResolvedValue(null);

      await expect(
        service.calculateHealthScore('bad-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
