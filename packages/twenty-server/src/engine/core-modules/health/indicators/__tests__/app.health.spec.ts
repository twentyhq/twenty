import { HealthIndicatorService } from '@nestjs/terminus';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { AppHealthIndicator } from 'src/engine/core-modules/health/indicators/app.health';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';

describe('AppHealthIndicator', () => {
  let service: AppHealthIndicator;
  let workspaceRepository: jest.Mocked<Repository<WorkspaceEntity>>;
  let workspaceMigrationService: jest.Mocked<WorkspaceMigrationService>;
  let healthIndicatorService: jest.Mocked<HealthIndicatorService>;

  beforeEach(async () => {
    workspaceRepository = {
      count: jest.fn(),
    } as any;

    workspaceMigrationService = {
      getWorkspacesWithPendingMigrations: jest.fn(),
      countWorkspacesWithPendingMigrations: jest.fn(),
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
          provide: WorkspaceMigrationService,
          useValue: workspaceMigrationService,
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

    workspaceMigrationService.countWorkspacesWithPendingMigrations.mockResolvedValue(
      0,
    );
    workspaceMigrationService.getWorkspacesWithPendingMigrations.mockResolvedValue(
      [],
    );

    const result = await service.isHealthy();

    expect(result.app.status).toBe('up');
    expect(result.app.details.overview.totalWorkspacesCount).toBe(2);
    expect(result.app.details.overview.erroredWorkspaceCount).toBe(0);
    expect(result.app.details.erroredWorkspace).toBe(null);
    expect(result.app.details.system.nodeVersion).toBeDefined();
    expect(result.app.details.system.timestamp).toBeDefined();
  });

  it('should return down status when there are pending migrations', async () => {
    workspaceRepository.count.mockResolvedValue(5);

    // Mock a total count that's higher than the sample
    workspaceMigrationService.countWorkspacesWithPendingMigrations.mockResolvedValue(
      10,
    );

    workspaceMigrationService.getWorkspacesWithPendingMigrations.mockResolvedValue(
      [
        {
          workspaceId: 'workspace1',
          pendingMigrations: 1,
        },
        {
          workspaceId: 'workspace2',
          pendingMigrations: 3,
        },
        {
          workspaceId: 'workspace3',
          pendingMigrations: 2,
        },
      ],
    );

    const result = await service.isHealthy();

    expect(result.app.status).toBe('down');
    expect(result.app.message).toBe(
      'Found 10 workspaces with pending migrations',
    );

    expect(result.app.details).toEqual({
      system: {
        nodeVersion: process.version,
        timestamp: expect.any(String),
      },
      overview: {
        totalWorkspacesCount: 5,
        erroredWorkspaceCount: 10,
      },
      erroredWorkspace: [
        {
          workspaceId: 'workspace1',
          pendingMigrations: 1,
        },
        {
          workspaceId: 'workspace2',
          pendingMigrations: 3,
        },
        {
          workspaceId: 'workspace3',
          pendingMigrations: 2,
        },
      ],
    });
  });

  it('should handle errors gracefully and maintain state history', async () => {
    workspaceRepository.count.mockRejectedValue(
      new Error('Database connection failed'),
    );

    const result = await service.isHealthy();

    expect(result.app.status).toBe('down');
    expect(result.app.message).toBe('Database connection failed');
    expect(result.app.details.system.nodeVersion).toBeDefined();
    expect(result.app.details.system.timestamp).toBeDefined();
    expect(result.app.details.stateHistory).toBeDefined();
  });

  it('should maintain state history across health checks', async () => {
    // First check - healthy state
    workspaceRepository.count.mockResolvedValue(2);
    workspaceMigrationService.countWorkspacesWithPendingMigrations.mockResolvedValue(
      0,
    );
    workspaceMigrationService.getWorkspacesWithPendingMigrations.mockResolvedValue(
      [],
    );

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

  it('should sample workspaces with pending migrations up to limit', async () => {
    workspaceRepository.count.mockResolvedValue(1000);

    // Mock a total count higher than the sample
    workspaceMigrationService.countWorkspacesWithPendingMigrations.mockResolvedValue(
      500,
    );

    const sampleWorkspaces = Array(300)
      .fill(0)
      .map((_, i) => ({
        workspaceId: `workspace${i}`,
        pendingMigrations: (i % 3) + 1,
      }));

    workspaceMigrationService.getWorkspacesWithPendingMigrations.mockResolvedValue(
      sampleWorkspaces,
    );

    const result = await service.isHealthy();

    expect(result.app.status).toBe('down');
    expect(result.app.message).toBe(
      'Found 500 workspaces with pending migrations',
    );
    expect(result.app.details.overview.totalWorkspacesCount).toBe(1000);
    expect(result.app.details.overview.erroredWorkspaceCount).toBe(500);
    expect(result.app.details.erroredWorkspace.length).toBe(300);
  });
});
