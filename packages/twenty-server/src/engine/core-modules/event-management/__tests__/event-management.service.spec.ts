import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

import { EventManagementService } from '../event-management.service';
import {
  CRMEventEntity,
  EventRegistrationEntity,
  RegistrationStatus,
} from '../event-management.entity';

describe('EventManagementService', () => {
  let service: EventManagementService;

  const mockEventRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'event-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
    increment: jest.fn(),
  };

  const mockRegRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'reg-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventManagementService,
        { provide: getRepositoryToken(CRMEventEntity), useValue: mockEventRepo },
        { provide: getRepositoryToken(EventRegistrationEntity), useValue: mockRegRepo },
      ],
    }).compile();

    service = module.get(EventManagementService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createEvent', () => {
    it('should create and return an event', async () => {
      const result = await service.createEvent('ws-1', { name: 'Tech Summit' });

      expect(mockEventRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ workspaceId: 'ws-1', name: 'Tech Summit' }),
      );
      expect(result).toHaveProperty('id');
    });
  });

  describe('registerAttendee', () => {
    it('should register an attendee with a QR code when capacity available', async () => {
      mockEventRepo.findOne.mockResolvedValue({
        id: 'event-1', capacity: 100, registrationCount: 50,
      });

      const result = await service.registerAttendee('event-1', 'contact-1');

      expect(result).toHaveProperty('qrCode');
      expect(result.contactId).toBe('contact-1');
      expect(mockEventRepo.save).toHaveBeenCalled();
    });

    it('should put attendee on waitlist when at capacity', async () => {
      mockEventRepo.findOne.mockResolvedValue({
        id: 'event-1', capacity: 50, registrationCount: 50,
      });

      const result = await service.registerAttendee('event-1', 'contact-1');

      expect(result.status).toBe(RegistrationStatus.WAITLIST);
    });

    it('should throw NotFoundException for non-existent event', async () => {
      mockEventRepo.findOne.mockResolvedValue(null);

      await expect(service.registerAttendee('bad-id', 'contact-1'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('checkIn', () => {
    it('should mark registration as attended and increment attendee count', async () => {
      mockRegRepo.findOne.mockResolvedValue({
        id: 'reg-1', eventId: 'event-1', status: RegistrationStatus.REGISTERED,
      });
      mockEventRepo.findOne.mockResolvedValue({
        id: 'event-1', attendeeCount: 10,
      });

      const result = await service.checkIn('reg-1');

      expect(result.status).toBe(RegistrationStatus.ATTENDED);
      expect(result.checkedInAt).toBeInstanceOf(Date);
    });

    it('should throw NotFoundException for invalid registration', async () => {
      mockRegRepo.findOne.mockResolvedValue(null);

      await expect(service.checkIn('bad-id'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getROI', () => {
    it('should calculate ROI correctly', async () => {
      mockEventRepo.findOne.mockResolvedValue({
        id: 'event-1',
        actualCost: 10_000,
        leadsGenerated: 50,
        dealsCreated: 5,
        revenueAttributed: 50_000,
      });

      const result = await service.getROI('event-1');

      expect(result.cost).toBe(10_000);
      expect(result.leads).toBe(50);
      expect(result.roi).toBe(400);
    });

    it('should throw NotFoundException for non-existent event', async () => {
      mockEventRepo.findOne.mockResolvedValue(null);

      await expect(service.getROI('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
