import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

import { AsteriskService } from '../asterisk.service';
import {
  AsteriskServerEntity,
  SIPExtensionEntity,
  CallLogEntity,
  CallQueueEntity,
  IVRMenuEntity,
  DialerCampaignEntity,
  SIPTrunkEntity,
  CallDirection,
  CallStatus,
} from '../asterisk.entity';

// Mock global fetch
global.fetch = jest.fn();

describe('AsteriskService', () => {
  let service: AsteriskService;

  const mockServerRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'srv-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
    update: jest.fn(),
  };

  const mockExtRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'ext-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
    update: jest.fn(),
  };

  const mockCallRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'call-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
    createQueryBuilder: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    }),
  };

  const mockQueueRepo = {
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'q-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  const mockIvrRepo = {
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'ivr-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  const mockDialerRepo = {
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'dialer-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
    update: jest.fn(),
  };

  const mockTrunkRepo = {
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'trunk-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AsteriskService,
        { provide: getRepositoryToken(AsteriskServerEntity), useValue: mockServerRepo },
        { provide: getRepositoryToken(SIPExtensionEntity), useValue: mockExtRepo },
        { provide: getRepositoryToken(CallLogEntity), useValue: mockCallRepo },
        { provide: getRepositoryToken(CallQueueEntity), useValue: mockQueueRepo },
        { provide: getRepositoryToken(IVRMenuEntity), useValue: mockIvrRepo },
        { provide: getRepositoryToken(DialerCampaignEntity), useValue: mockDialerRepo },
        { provide: getRepositoryToken(SIPTrunkEntity), useValue: mockTrunkRepo },
      ],
    }).compile();

    service = module.get(AsteriskService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('clickToCall', () => {
    it('should initiate a call and create a call log', async () => {
      mockServerRepo.findOne.mockResolvedValue({
        id: 'srv-1',
        isActive: true,
        ariUrl: 'http://localhost:8088',
        ariUser: 'admin',
        ariPassword: 'pass',
      });
      mockExtRepo.findOne.mockResolvedValue({
        extension: '100',
        callerIdNumber: '3001234567',
      });
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({}),
      });

      const result = await service.clickToCall('ws-1', 'user-1', '3009876543', {
        contactId: 'contact-1',
      });

      expect(result.direction).toBe(CallDirection.OUTBOUND);
      expect(result.status).toBe(CallStatus.RINGING);
      expect(result.calledNumber).toBe('3009876543');
      expect(result.contactId).toBe('contact-1');
    });

    it('should throw NotFoundException when no server configured', async () => {
      mockServerRepo.findOne.mockResolvedValue(null);

      await expect(
        service.clickToCall('ws-1', 'user-1', '3001234567'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when user has no extension', async () => {
      mockServerRepo.findOne.mockResolvedValue({
        id: 'srv-1',
        isActive: true,
        ariUrl: 'http://localhost:8088',
        ariUser: 'admin',
        ariPassword: 'pass',
      });
      mockExtRepo.findOne.mockResolvedValue(null);

      await expect(
        service.clickToCall('ws-1', 'user-1', '3001234567'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('handleCallEvent', () => {
    it('should handle answer event', async () => {
      mockCallRepo.findOne.mockResolvedValue({
        id: 'call-1',
        uniqueId: 'uid-1',
        status: CallStatus.RINGING,
      });

      const result = await service.handleCallEvent('ws-1', {
        uniqueId: 'uid-1',
        eventType: 'answer',
        data: {},
      });

      expect(result).not.toBeNull();
      expect(result!.status).toBe(CallStatus.ANSWERED);
      expect(result!.answerTime).toBeInstanceOf(Date);
    });

    it('should return null for unknown call', async () => {
      mockCallRepo.findOne.mockResolvedValue(null);

      const result = await service.handleCallEvent('ws-1', {
        uniqueId: 'unknown',
        eventType: 'answer',
        data: {},
      });

      expect(result).toBeNull();
    });

    it('should handle hangup event and calculate duration', async () => {
      const answerTime = new Date(Date.now() - 120_000);
      mockCallRepo.findOne.mockResolvedValue({
        id: 'call-1',
        uniqueId: 'uid-1',
        status: CallStatus.ANSWERED,
        answerTime,
      });

      const result = await service.handleCallEvent('ws-1', {
        uniqueId: 'uid-1',
        eventType: 'hangup',
        data: {},
      });

      expect(result!.status).toBe(CallStatus.COMPLETED);
      expect(result!.durationSeconds).toBeGreaterThan(0);
    });
  });

  describe('getCallAnalytics', () => {
    it('should return analytics with correct structure', async () => {
      const result = await service.getCallAnalytics(
        'ws-1',
        new Date('2026-01-01'),
        new Date('2026-12-31'),
      );

      expect(result).toHaveProperty('totalCalls', 0);
      expect(result).toHaveProperty('inbound', 0);
      expect(result).toHaveProperty('outbound', 0);
      expect(result).toHaveProperty('answered', 0);
      expect(result).toHaveProperty('missed', 0);
      expect(result).toHaveProperty('avgDuration', 0);
      expect(result).toHaveProperty('topCallers');
      expect(Array.isArray(result.topCallers)).toBe(true);
    });
  });
});
