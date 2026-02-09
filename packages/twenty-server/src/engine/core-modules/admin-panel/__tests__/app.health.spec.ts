import { HealthIndicatorService } from '@nestjs/terminus';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { AppHealthIndicator } from 'src/engine/core-modules/admin-panel/indicators/app.health';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

describe('AppHealthIndicator', () => {
  let service: AppHealthIndicator;
  let workspaceRepository: jest.Mocked<Repository<WorkspaceEntity>>;
  let healthIndicatorService: jest.Mocked<HealthIndicatorService>;

  beforeEach(async () => {
    workspaceRepository = {
      count: jest.fn(),
    } as any;

    healthIndicatorService = {
      check: jest.fn().mockReturnValue({
        up: jest.fn().mockImplementation((data) => ({
          app: { status: 'up', ...data },
        })),
        down: jest.fn().mockImplementation((data) => ({
          app: { status: 'down', ...data },
        })),
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppHealthIndicator,
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: workspaceRepository,
        },
        {
          provide: HealthIndicatorService,
          useValue: healthIndicatorService,
        },
      ],
    }).compile();

    service = module.get<AppHealthIndicator>(AppHealthIndicator);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return up status when no issues and no pending migrations', async () => {
    workspaceRepository.count.mockResolvedValue(2);

    const result = await service.isHealthy();

    expect(result.app.status).toBe('up');
    expect(result.app.details.overview.totalWorkspacesCount).toBe(2);
    expect(result.app.details.overview.erroredWorkspaceCount).toBe(0);
    expect(result.app.details.system.nodeVersion).toBeDefined();
    expect(result.app.details.system.timestamp).toBeDefined();
  });

  it('should maintain state history across health checks', async () => {
    // First check - healthy state
    workspaceRepository.count.mockResolvedValue(2);

    await service.isHealthy();

    // Second check - error state
    workspaceRepository.count.mockRejectedValue(
      new Error('Database connection failed'),
    );

    const result = await service.isHealthy();

    expect(result.app.details.stateHistory).toBeDefined();
    expect(result.app.details.stateHistory.age).toBeDefined();
    expect(result.app.details.stateHistory.timestamp).toBeDefined();
    expect(result.app.details.stateHistory.details).toBeDefined();
  });
});
