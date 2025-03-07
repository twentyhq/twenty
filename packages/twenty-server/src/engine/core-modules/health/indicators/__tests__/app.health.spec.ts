import { HealthIndicatorService } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';

import { AppHealthIndicator } from 'src/engine/core-modules/health/indicators/app.health';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { WorkspaceHealthService } from 'src/engine/workspace-manager/workspace-health/workspace-health.service';

describe('AppHealthIndicator', () => {
  let service: AppHealthIndicator;
  let objectMetadataService: jest.Mocked<ObjectMetadataService>;
  let workspaceHealthService: jest.Mocked<WorkspaceHealthService>;
  let workspaceMigrationService: jest.Mocked<WorkspaceMigrationService>;
  let healthIndicatorService: jest.Mocked<HealthIndicatorService>;

  beforeEach(async () => {
    objectMetadataService = {
      findMany: jest.fn(),
    } as any;

    workspaceHealthService = {
      healthCheck: jest.fn(),
    } as any;

    workspaceMigrationService = {
      getPendingMigrations: jest.fn(),
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
          provide: ObjectMetadataService,
          useValue: objectMetadataService,
        },
        {
          provide: WorkspaceHealthService,
          useValue: workspaceHealthService,
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
    objectMetadataService.findMany.mockResolvedValue([
      {
        id: '1',
        workspaceId: 'workspace1',
      } as any,
      {
        id: '2',
        workspaceId: 'workspace2',
      } as any,
    ]);

    workspaceMigrationService.getPendingMigrations.mockResolvedValue([]);

    const result = await service.isHealthy();

    expect(result.app.status).toBe('up');
    expect(result.app.details.overview.totalWorkspacesCount).toBe(2);
    expect(result.app.details.overview.criticalWorkspacesCount).toBe(0);
    expect(result.app.details.criticalWorkspaces).toBe(null);
    expect(result.app.details.system.nodeVersion).toBeDefined();
    expect(result.app.details.system.timestamp).toBeDefined();
  });

  it('should return down status when there are pending migrations', async () => {
    objectMetadataService.findMany.mockResolvedValue([
      {
        id: '1',
        workspaceId: 'workspace1',
      } as any,
    ]);

    workspaceMigrationService.getPendingMigrations.mockResolvedValue([
      {
        id: '1',
        createdAt: new Date(),
        migrations: [],
        name: 'migration1',
        isCustom: false,
        workspaceId: 'workspace1',
      } as any,
    ]);

    const result = await service.isHealthy();

    expect(result.app.status).toBe('down');
    expect(result.app.details.overview.criticalWorkspacesCount).toBe(1);
    expect(result.app.details.criticalWorkspaces).toEqual([
      {
        workspaceId: 'workspace1',
        pendingMigrations: 1,
      },
    ]);
  });

  it('should handle errors gracefully and maintain state history', async () => {
    objectMetadataService.findMany.mockRejectedValue(
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
    objectMetadataService.findMany.mockResolvedValue([
      {
        id: '1',
        workspaceId: 'workspace1',
      } as any,
    ]);
    workspaceMigrationService.getPendingMigrations.mockResolvedValue([]);

    await service.isHealthy();

    // Second check - error state
    objectMetadataService.findMany.mockRejectedValue(
      new Error('Database connection failed'),
    );

    const result = await service.isHealthy();

    expect(result.app.details.stateHistory).toBeDefined();
    expect(result.app.details.stateHistory.age).toBeDefined();
    expect(result.app.details.stateHistory.timestamp).toBeDefined();
    expect(result.app.details.stateHistory.details).toBeDefined();
  });
});
