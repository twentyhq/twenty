import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

import { HRMService } from '../hrm.service';
import {
  EmployeeEntity,
  RecruitmentCandidateEntity,
  PayrollRecordEntity,
  PerformanceReviewEntity,
  LeaveRequestEntity,
  EmployeeSatisfactionEntity,
  EmployeeStatus,
} from '../hrm.entity';

describe('HRMService', () => {
  let service: HRMService;

  const mockEmpRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'emp-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
    count: jest.fn().mockResolvedValue(0),
    increment: jest.fn(),
  };

  const mockCandidateRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'cand-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
    update: jest.fn(),
  };

  const mockPayrollRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'pay-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  const mockReviewRepo = {
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'rev-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  const mockLeaveRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'leave-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  const mockSatisfactionRepo = {
    find: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'sat-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HRMService,
        { provide: getRepositoryToken(EmployeeEntity), useValue: mockEmpRepo },
        { provide: getRepositoryToken(RecruitmentCandidateEntity), useValue: mockCandidateRepo },
        { provide: getRepositoryToken(PayrollRecordEntity), useValue: mockPayrollRepo },
        { provide: getRepositoryToken(PerformanceReviewEntity), useValue: mockReviewRepo },
        { provide: getRepositoryToken(LeaveRequestEntity), useValue: mockLeaveRepo },
        { provide: getRepositoryToken(EmployeeSatisfactionEntity), useValue: mockSatisfactionRepo },
      ],
    }).compile();

    service = module.get(HRMService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createEmployee', () => {
    it('should create an employee and return it', async () => {
      const result = await service.createEmployee('ws-1', {
        fullName: 'John Doe',
        email: 'john@test.com',
        position: 'Developer',
      } as Partial<EmployeeEntity>);

      expect(mockEmpRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ workspaceId: 'ws-1', fullName: 'John Doe' }),
      );
      expect(result).toHaveProperty('fullName', 'John Doe');
    });
  });

  describe('calculatePayroll', () => {
    it('should calculate payroll with deductions for high salary', async () => {
      mockEmpRepo.findOne.mockResolvedValue({
        id: 'emp-1',
        baseSalary: 5_000_000,
      });

      const result = await service.calculatePayroll('ws-1', 'emp-1', '2026-04');

      expect(mockPayrollRepo.save).toHaveBeenCalled();
      expect(result.baseSalary).toBe(5_000_000);
      expect(result.healthDeduction).toBe(200_000);
      expect(result.pensionDeduction).toBe(200_000);
      expect(result.taxWithholding).toBe(350_000);
      expect(result.netPay).toBe(4_250_000);
    });

    it('should calculate payroll without tax for low salary', async () => {
      mockEmpRepo.findOne.mockResolvedValue({
        id: 'emp-1',
        baseSalary: 3_000_000,
      });

      const result = await service.calculatePayroll('ws-1', 'emp-1', '2026-04');

      expect(result.taxWithholding).toBe(0);
    });

    it('should throw NotFoundException for non-existent employee', async () => {
      mockEmpRepo.findOne.mockResolvedValue(null);

      await expect(
        service.calculatePayroll('ws-1', 'bad-id', '2026-04'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getWorkforceAnalytics', () => {
    it('should return analytics with correct shape', async () => {
      mockEmpRepo.find.mockResolvedValue([
        { baseSalary: 4_000_000 },
        { baseSalary: 6_000_000 },
      ]);
      mockEmpRepo.count.mockResolvedValue(1);

      const result = await service.getWorkforceAnalytics('ws-1');

      expect(result).toHaveProperty('headcount', 2);
      expect(result).toHaveProperty('avgSalary', 5_000_000);
      expect(result).toHaveProperty('payrollCost', 10_000_000);
      expect(typeof result.turnoverRate).toBe('number');
    });

    it('should handle empty workforce', async () => {
      mockEmpRepo.find.mockResolvedValue([]);
      mockEmpRepo.count.mockResolvedValue(0);

      const result = await service.getWorkforceAnalytics('ws-1');

      expect(result.headcount).toBe(0);
      expect(result.avgSalary).toBe(0);
    });
  });
});
