import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

import { LMSService } from '../lms.service';
import {
  LMSCourseEntity,
  LMSEnrollmentEntity,
  RetentionQuizEntity,
  EnrollmentStatus,
} from '../lms.entity';

describe('LMSService', () => {
  let service: LMSService;

  const mockCourseRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'course-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
    increment: jest.fn(),
  };

  const mockEnrollRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'enroll-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  const mockQuizRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'quiz-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LMSService,
        { provide: getRepositoryToken(LMSCourseEntity), useValue: mockCourseRepo },
        { provide: getRepositoryToken(LMSEnrollmentEntity), useValue: mockEnrollRepo },
        { provide: getRepositoryToken(RetentionQuizEntity), useValue: mockQuizRepo },
      ],
    }).compile();

    service = module.get(LMSService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCourse', () => {
    it('should create a course and calculate estimated minutes from modules', async () => {
      const result = await service.createCourse('ws-1', {
        title: 'Sales 101',
        modules: [
          { name: 'Intro', lessons: [{ title: 'Welcome', durationMinutes: 10 }, { title: 'Overview', durationMinutes: 15 }] },
        ],
      } as any);

      expect(mockCourseRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ workspaceId: 'ws-1', estimatedMinutes: 25 }),
      );
      expect(result).toHaveProperty('id');
    });

    it('should default to 0 minutes when no modules provided', async () => {
      await service.createCourse('ws-1', { title: 'Empty Course' });

      expect(mockCourseRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ estimatedMinutes: 0 }),
      );
    });
  });

  describe('enrollUser', () => {
    it('should enroll a new user and increment course enrollment count', async () => {
      mockEnrollRepo.findOne.mockResolvedValue(null);

      const result = await service.enrollUser('course-1', 'user-1');

      expect(mockCourseRepo.increment).toHaveBeenCalledWith({ id: 'course-1' }, 'enrollmentCount', 1);
      expect(result).toHaveProperty('courseId', 'course-1');
    });

    it('should return existing enrollment without duplicating', async () => {
      const existing = { id: 'enroll-existing', courseId: 'course-1', userId: 'user-1' };
      mockEnrollRepo.findOne.mockResolvedValue(existing);

      const result = await service.enrollUser('course-1', 'user-1');

      expect(result).toBe(existing);
      expect(mockCourseRepo.increment).not.toHaveBeenCalled();
    });
  });

  describe('submitQuiz', () => {
    it('should mark as completed and schedule retention quizzes on passing score', async () => {
      mockEnrollRepo.findOne.mockResolvedValue({
        id: 'enroll-1', courseId: 'course-1', userId: 'user-1',
        status: EnrollmentStatus.IN_PROGRESS, quizScore: null,
      });
      mockCourseRepo.findOne.mockResolvedValue({
        id: 'course-1', completionCount: 5, avgScore: 80, certificationExpiryDays: 365,
      });

      const result = await service.submitQuiz('enroll-1', 85);

      expect(result.status).toBe(EnrollmentStatus.COMPLETED);
      expect(result.quizScore).toBe(85);
      expect(result.completedAt).toBeInstanceOf(Date);
      expect(mockQuizRepo.save).toHaveBeenCalledTimes(3);
    });

    it('should mark as failed on score below 70', async () => {
      mockEnrollRepo.findOne.mockResolvedValue({
        id: 'enroll-1', courseId: 'course-1', userId: 'user-1',
        status: EnrollmentStatus.IN_PROGRESS,
      });

      const result = await service.submitQuiz('enroll-1', 50);

      expect(result.status).toBe(EnrollmentStatus.FAILED);
      expect(mockQuizRepo.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException for invalid enrollment', async () => {
      mockEnrollRepo.findOne.mockResolvedValue(null);

      await expect(service.submitQuiz('bad-id', 90))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getTrainingROI', () => {
    it('should compute completion rate and average score', async () => {
      mockCourseRepo.find.mockResolvedValue([
        { enrollmentCount: 10, completionCount: 8, avgScore: 85 },
        { enrollmentCount: 20, completionCount: 10, avgScore: 75 },
      ]);

      const result = await service.getTrainingROI('ws-1');

      expect(result.totalEnrollments).toBe(30);
      expect(result.completionRate).toBe(60);
      expect(result.avgScore).toBe(80);
    });

    it('should handle zero enrollments gracefully', async () => {
      mockCourseRepo.find.mockResolvedValue([]);

      const result = await service.getTrainingROI('ws-1');

      expect(result.totalEnrollments).toBe(0);
      expect(result.completionRate).toBe(0);
      expect(result.avgScore).toBe(0);
    });
  });
});
