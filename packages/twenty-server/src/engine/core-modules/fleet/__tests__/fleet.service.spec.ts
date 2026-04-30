import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

import { FleetService } from '../fleet.service';
import {
  FleetVehicleEntity,
  FleetDriverEntity,
  FleetDeliveryEntity,
  FleetRouteEntity,
  FuelLogEntity,
  MaintenanceOrderEntity,
  DeliveryStatus,
} from '../fleet.entity';

describe('FleetService', () => {
  let service: FleetService;

  const mockVehicleRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'v-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
    update: jest.fn(),
  };

  const mockDriverRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'd-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
    update: jest.fn(),
  };

  const mockDeliveryRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'del-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  const mockRouteRepo = {
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'route-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  const mockFuelRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'fuel-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
    count: jest.fn().mockResolvedValue(0),
  };

  const mockMaintenanceRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'maint-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FleetService,
        { provide: getRepositoryToken(FleetVehicleEntity), useValue: mockVehicleRepo },
        { provide: getRepositoryToken(FleetDriverEntity), useValue: mockDriverRepo },
        { provide: getRepositoryToken(FleetDeliveryEntity), useValue: mockDeliveryRepo },
        { provide: getRepositoryToken(FleetRouteEntity), useValue: mockRouteRepo },
        { provide: getRepositoryToken(FuelLogEntity), useValue: mockFuelRepo },
        { provide: getRepositoryToken(MaintenanceOrderEntity), useValue: mockMaintenanceRepo },
      ],
    }).compile();

    service = module.get(FleetService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerVehicle', () => {
    it('should register a vehicle', async () => {
      const result = await service.registerVehicle('ws-1', {
        plateNumber: 'ABC-123',
        model: 'Truck',
      } as Partial<FleetVehicleEntity>);

      expect(mockVehicleRepo.create).toHaveBeenCalled();
      expect(result).toHaveProperty('plateNumber', 'ABC-123');
    });
  });

  describe('autoDispatch', () => {
    it('should assign nearest available driver', async () => {
      mockDeliveryRepo.findOne.mockResolvedValue({
        id: 'del-1',
        deliveryLat: 4.65,
        deliveryLng: -74.05,
      });

      mockDriverRepo.find.mockResolvedValue([
        {
          id: 'd-1',
          isAvailable: true,
          currentLat: 4.64,
          currentLng: -74.06,
          assignedVehicleId: 'v-1',
        },
      ]);

      mockVehicleRepo.findOne.mockResolvedValue({
        id: 'v-1',
        capacityKg: 1000,
      });

      const result = await service.autoDispatch('ws-1', 'del-1');

      expect(result.driverId).toBe('d-1');
      expect(result.status).toBe(DeliveryStatus.ASSIGNED);
    });

    it('should throw NotFoundException when delivery not found', async () => {
      mockDeliveryRepo.findOne.mockResolvedValue(null);

      await expect(service.autoDispatch('ws-1', 'bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when no drivers available', async () => {
      mockDeliveryRepo.findOne.mockResolvedValue({ id: 'del-1' });
      mockDriverRepo.find.mockResolvedValue([]);

      await expect(service.autoDispatch('ws-1', 'del-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('completeDelivery', () => {
    it('should mark delivery as delivered with proof', async () => {
      mockDeliveryRepo.findOne.mockResolvedValue({
        id: 'del-1',
        status: DeliveryStatus.EN_ROUTE,
        driverId: 'd-1',
        vehicleId: 'v-1',
        distanceKm: 10,
        estimatedMinutes: 30,
      });

      mockVehicleRepo.findOne.mockResolvedValue({
        id: 'v-1',
        avgFuelConsumption: 10,
        purchasePrice: 60_000_000,
        totalDeliveries: 5,
      });

      mockDriverRepo.findOne.mockResolvedValue({
        id: 'd-1',
        isAvailable: false,
        deliveriesCompleted: 10,
        totalKmDriven: 200,
        onTimeRate: 90,
        avgCustomerRating: 4.5,
        fuelEfficiencyScore: 80,
      });

      mockDeliveryRepo.find.mockResolvedValue([]);

      const result = await service.completeDelivery('del-1', {
        signature: 'sig-data',
        customerRating: 5,
      });

      expect(result.status).toBe(DeliveryStatus.DELIVERED);
      expect(result.deliveredAt).toBeInstanceOf(Date);
    });

    it('should throw NotFoundException for invalid delivery', async () => {
      mockDeliveryRepo.findOne.mockResolvedValue(null);

      await expect(
        service.completeDelivery('bad-id', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAnalytics', () => {
    it('should return analytics with correct shape', async () => {
      mockVehicleRepo.find.mockResolvedValue([]);
      mockDeliveryRepo.find.mockResolvedValue([]);
      mockFuelRepo.count.mockResolvedValue(0);

      const result = await service.getAnalytics('ws-1');

      expect(result).toHaveProperty('totalVehicles', 0);
      expect(result).toHaveProperty('activeDeliveries', 0);
      expect(result).toHaveProperty('avgCostPerDelivery', 0);
      expect(result).toHaveProperty('anomalyCount', 0);
    });
  });
});
