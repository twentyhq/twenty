import { HealthIndicatorService } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { AppHealthIndicator } from 'src/engine/core-modules/health/indicators/app.health';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';

describe('AppHealthIndicator', () => {
  let service: AppHealthIndicator;
  let workspaceRepository: jest.Mocked<Repository<Workspace>>;
  let workspaceMigrationService: jest.Mocked<WorkspaceMigrationService>;
  let healthIndicatorService: jest.Mocked<HealthIndicatorService>;

  beforeEach(async () => {
    workspaceRepository = {
      count: jest.fn(),
    } as any;

    workspaceMigrationService = {
      findWorkspacesWithPendingMigrations: jest.fn(),
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
          provide: getRepositoryToken(Workspace, 'core'),
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

    workspaceMigrationService.findWorkspacesWithPendingMigrations.mockResolvedValue(
      [],
    );

    const result = await service.isHealthy();

    expect(result.app.status).toBe('up');
    expect(result.app.details.overview.totalWorkspacesCount).toBe(2);
    expect(result.app.details.overview.criticalWorkspacesCount).toBe(0);
    expect(result.app.details.criticalWorkspaces).toBe(null);
    expect(result.app.details.system.nodeVersion).toBeDefined();
    expect(result.app.details.system.timestamp).toBeDefined();
  });

  it('should return down status when there are pending migrations', async () => {
    workspaceRepository.count.mockResolvedValue(5);

    workspaceMigrationService.findWorkspacesWithPendingMigrations.mockResolvedValue(
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
      'Found 3 workspaces with pending migrations',
    );

    expect(result.app.details).toEqual({
      system: {
        nodeVersion: process.version,
        timestamp: expect.any(String),
      },
      overview: {
        totalWorkspacesCount: 5,
        criticalWorkspacesCount: 3,
      },
      criticalWorkspaces: [
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
      new Error('Database connection failed'), //random error
    );

    const result = await service.isHealthy();

    expect(result.app.status).toBe('down');
    expect(result.app.message).toBe('Database connection failed');
    expect(result.app.details.system.nodeVersion).toBeDefined();
    expect(result.app.details.system.timestamp).toBeDefined();
    expect(result.app.details.stateHistory).toBeDefined();
  });

  it('should maintain state history across health checks', async () => {
    workspaceRepository.count.mockResolvedValue(2);
    workspaceMigrationService.findWorkspacesWithPendingMigrations.mockResolvedValue(
      [],
    );

    await service.isHealthy();

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
