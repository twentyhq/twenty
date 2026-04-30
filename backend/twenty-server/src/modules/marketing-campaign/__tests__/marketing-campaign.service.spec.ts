import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

import { MarketingCampaignService } from '../marketing-campaign.service';
import {
  MarketingCampaignEntity,
  LeadScoreRuleEntity,
  LeadScoreEntity,
  CampaignTouchpointEntity,
  CampaignStatus,
  LeadScoreAction,
} from '../marketing-campaign.entity';

describe('MarketingCampaignService', () => {
  let service: MarketingCampaignService;

  const mockCampaignRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'camp-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
    increment: jest.fn(),
  };

  const mockScoreRuleRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'rule-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  const mockLeadScoreRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'score-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  const mockTouchpointRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'tp-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketingCampaignService,
        { provide: getRepositoryToken(MarketingCampaignEntity), useValue: mockCampaignRepo },
        { provide: getRepositoryToken(LeadScoreRuleEntity), useValue: mockScoreRuleRepo },
        { provide: getRepositoryToken(LeadScoreEntity), useValue: mockLeadScoreRepo },
        { provide: getRepositoryToken(CampaignTouchpointEntity), useValue: mockTouchpointRepo },
      ],
    }).compile();

    service = module.get(MarketingCampaignService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCampaign', () => {
    it('should create and return a campaign', async () => {
      const result = await service.createCampaign('ws-1', { name: 'Q2 Launch' });

      expect(mockCampaignRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ workspaceId: 'ws-1', name: 'Q2 Launch' }),
      );
      expect(result).toHaveProperty('id');
    });
  });

  describe('processLeadAction', () => {
    it('should accumulate points and set tier to warm', async () => {
      mockScoreRuleRepo.find.mockResolvedValue([
        { action: LeadScoreAction.EMAIL_CLICK, points: 15, isActive: true },
      ]);
      mockLeadScoreRepo.findOne.mockResolvedValue(null);
      mockLeadScoreRepo.create.mockReturnValue({
        totalScore: 0, scoreBreakdown: {}, workspaceId: 'ws-1', contactId: 'contact-1',
      });

      const result = await service.processLeadAction('ws-1', 'contact-1', LeadScoreAction.EMAIL_CLICK);

      expect(result.totalScore).toBe(15);
      expect(result.tier).toBe('cold');
    });

    it('should promote to MQL when score reaches 60', async () => {
      mockScoreRuleRepo.find.mockResolvedValue([
        { action: LeadScoreAction.DEMO_REQUEST, points: 30, isActive: true },
      ]);
      mockLeadScoreRepo.findOne.mockResolvedValue({
        totalScore: 35, scoreBreakdown: {}, isMQL: false,
      });

      const result = await service.processLeadAction('ws-1', 'contact-1', LeadScoreAction.DEMO_REQUEST);

      expect(result.totalScore).toBe(65);
      expect(result.tier).toBe('warm');
      expect(result.isMQL).toBe(true);
      expect(result.mqlAt).toBeInstanceOf(Date);
    });

    it('should return unchanged score when no active rules match', async () => {
      mockScoreRuleRepo.find.mockResolvedValue([]);
      mockLeadScoreRepo.findOne.mockResolvedValue({
        totalScore: 10, scoreBreakdown: {},
      });

      const result = await service.processLeadAction('ws-1', 'contact-1', LeadScoreAction.PAGE_VISIT);

      expect(result.totalScore).toBe(10);
    });
  });

  describe('getCampaignROI', () => {
    it('should calculate CPL, CPO, and ROI', async () => {
      mockCampaignRepo.findOne.mockResolvedValue({
        id: 'camp-1', spent: 5000, leadsGenerated: 100, dealsCreated: 10, revenueAttributed: 50_000,
      });

      const result = await service.getCampaignROI('camp-1');

      expect(result.cpl).toBe(50);
      expect(result.cpo).toBe(500);
      expect(result.roi).toBe(900);
    });

    it('should throw NotFoundException for non-existent campaign', async () => {
      mockCampaignRepo.findOne.mockResolvedValue(null);

      await expect(service.getCampaignROI('bad-id'))
        .rejects.toThrow(NotFoundException);
    });
  });
});
