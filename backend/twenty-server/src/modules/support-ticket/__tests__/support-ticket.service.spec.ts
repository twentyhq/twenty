import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

import { SupportTicketService } from '../support-ticket.service';
import {
  SupportTicketEntity,
  SLAPolicyEntity,
  TicketCommentEntity,
  TicketStatus,
  TicketPriority,
} from '../support-ticket.entity';

describe('SupportTicketService', () => {
  let service: SupportTicketService;

  const mockTicketRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'ticket-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
    count: jest.fn(),
  };

  const mockSlaRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'sla-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  const mockCommentRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'comment-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupportTicketService,
        { provide: getRepositoryToken(SupportTicketEntity), useValue: mockTicketRepo },
        { provide: getRepositoryToken(SLAPolicyEntity), useValue: mockSlaRepo },
        { provide: getRepositoryToken(TicketCommentEntity), useValue: mockCommentRepo },
      ],
    }).compile();

    service = module.get(SupportTicketService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTicket', () => {
    it('should create a ticket and return it', async () => {
      const result = await service.createTicket('ws-1', {
        subject: 'Test ticket',
        priority: TicketPriority.HIGH,
      });

      expect(mockTicketRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ workspaceId: 'ws-1', subject: 'Test ticket' }),
      );
      expect(mockTicketRepo.save).toHaveBeenCalled();
      expect(result).toHaveProperty('subject', 'Test ticket');
    });
  });

  describe('assignTicket', () => {
    it('should assign a ticket to a user', async () => {
      mockTicketRepo.findOne.mockResolvedValue({
        id: 'ticket-1',
        status: TicketStatus.OPEN,
        assigneeId: null,
      });

      const result = await service.assignTicket('ticket-1', 'user-1');

      expect(result.assigneeId).toBe('user-1');
      expect(result.status).toBe(TicketStatus.IN_PROGRESS);
    });

    it('should throw NotFoundException for invalid ticket', async () => {
      mockTicketRepo.findOne.mockResolvedValue(null);

      await expect(service.assignTicket('bad-id', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('resolveTicket', () => {
    it('should resolve a ticket and set resolvedAt', async () => {
      mockTicketRepo.findOne.mockResolvedValue({
        id: 'ticket-1',
        status: TicketStatus.IN_PROGRESS,
      });

      const result = await service.resolveTicket('ticket-1');

      expect(result.status).toBe(TicketStatus.RESOLVED);
      expect(result.resolvedAt).toBeInstanceOf(Date);
    });

    it('should throw NotFoundException for non-existent ticket', async () => {
      mockTicketRepo.findOne.mockResolvedValue(null);

      await expect(service.resolveTicket('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getMetrics', () => {
    it('should return metrics with correct types', async () => {
      mockTicketRepo.find.mockResolvedValue([]);

      const result = await service.getMetrics('ws-1');

      expect(result).toHaveProperty('open');
      expect(result).toHaveProperty('avgFirstResponse');
      expect(result).toHaveProperty('avgResolution');
      expect(result).toHaveProperty('csat');
      expect(result).toHaveProperty('fcrRate');
      expect(typeof result.open).toBe('number');
    });

    it('should compute metrics from ticket data', async () => {
      const now = new Date();
      const earlier = new Date(now.getTime() - 60 * 60_000);

      mockTicketRepo.find.mockResolvedValue([
        {
          id: 't1',
          status: TicketStatus.RESOLVED,
          resolvedAt: now,
          createdAt: earlier,
          firstResponseAt: new Date(earlier.getTime() + 10 * 60_000),
          csatScore: 5,
        },
      ]);

      const result = await service.getMetrics('ws-1');

      expect(result.open).toBe(0);
      expect(result.csat).toBe(5);
      expect(result.avgResolution).toBeGreaterThan(0);
    });
  });
});
