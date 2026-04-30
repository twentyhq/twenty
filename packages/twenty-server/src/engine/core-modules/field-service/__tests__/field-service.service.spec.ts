import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

import { FieldServiceService } from '../field-service.service';
import {
  WorkOrderEntity,
  TechnicianEntity,
  ServiceContractEntity,
  WorkOrderStatus,
} from '../field-service.entity';

describe('FieldServiceService', () => {
  let service: FieldServiceService;

  const mockWoRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'wo-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
    update: jest.fn(),
  };

  const mockTechRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'tech-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
    update: jest.fn(),
  };

  const mockContractRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'sc-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FieldServiceService,
        { provide: getRepositoryToken(WorkOrderEntity), useValue: mockWoRepo },
        { provide: getRepositoryToken(TechnicianEntity), useValue: mockTechRepo },
        { provide: getRepositoryToken(ServiceContractEntity), useValue: mockContractRepo },
      ],
    }).compile();

    service = module.get(FieldServiceService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createWorkOrder', () => {
    it('should create and return a work order', async () => {
      const result = await service.createWorkOrder('ws-1', { type: 'repair' });

      expect(mockWoRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ workspaceId: 'ws-1', type: 'repair' }),
      );
      expect(mockWoRepo.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
    });
  });

  describe('autoDispatch', () => {
    it('should dispatch to the nearest available technician with matching skill', async () => {
      mockWoRepo.findOne.mockResolvedValue({
        id: 'wo-1', latitude: 4.6, longitude: -74.1, type: 'hvac',
      });
      mockTechRepo.find.mockResolvedValue([
        { id: 'tech-far', currentLat: 10, currentLng: -75, skills: ['hvac'], isAvailable: true },
        { id: 'tech-near', currentLat: 4.7, currentLng: -74.0, skills: ['hvac'], isAvailable: true },
      ]);

      const result = await service.autoDispatch('ws-1', 'wo-1');

      expect(result.technicianId).toBe('tech-near');
      expect(result.status).toBe(WorkOrderStatus.DISPATCHED);
    });

    it('should throw NotFoundException when work order not found', async () => {
      mockWoRepo.findOne.mockResolvedValue(null);

      await expect(service.autoDispatch('ws-1', 'bad-id'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when no technicians available', async () => {
      mockWoRepo.findOne.mockResolvedValue({ id: 'wo-1' });
      mockTechRepo.find.mockResolvedValue([]);

      await expect(service.autoDispatch('ws-1', 'wo-1'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('completeWork', () => {
    it('should complete work order and update technician stats', async () => {
      mockWoRepo.findOne.mockResolvedValue({
        id: 'wo-1', technicianId: 'tech-1', status: WorkOrderStatus.IN_PROGRESS,
      });
      mockTechRepo.findOne.mockResolvedValue({
        id: 'tech-1', isAvailable: false, completedOrders: 5,
      });
      mockWoRepo.find.mockResolvedValue([
        { firstTimeFix: true, customerRating: 4.5 },
        { firstTimeFix: true, customerRating: 5 },
      ]);

      const result = await service.completeWork('wo-1', {
        signature: 'sig', firstTimeFix: true,
      });

      expect(result.status).toBe(WorkOrderStatus.COMPLETED);
      expect(result.actualEnd).toBeInstanceOf(Date);
      expect(mockTechRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent work order', async () => {
      mockWoRepo.findOne.mockResolvedValue(null);

      await expect(service.completeWork('bad-id', {}))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getAvailableTechnicians', () => {
    it('should filter by skill and sort by distance when location provided', async () => {
      mockTechRepo.find.mockResolvedValue([
        { id: 't1', name: 'Alice', skills: ['hvac'], currentLat: 5, currentLng: -74, performanceScore: 80 },
        { id: 't2', name: 'Bob', skills: ['plumbing'], currentLat: 4.5, currentLng: -74, performanceScore: 90 },
        { id: 't3', name: 'Carol', skills: ['hvac'], currentLat: 4.6, currentLng: -74.1, performanceScore: 70 },
      ]);

      const result = await service.getAvailableTechnicians('ws-1', 'hvac', { lat: 4.6, lng: -74.1 });

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Carol');
      expect(result[1].name).toBe('Alice');
    });

    it('should sort by performance when no location provided', async () => {
      mockTechRepo.find.mockResolvedValue([
        { id: 't1', name: 'Alice', skills: ['hvac'], performanceScore: 70 },
        { id: 't2', name: 'Bob', skills: ['hvac'], performanceScore: 95 },
      ]);

      const result = await service.getAvailableTechnicians('ws-1');

      expect(result[0].name).toBe('Bob');
    });
  });
});
