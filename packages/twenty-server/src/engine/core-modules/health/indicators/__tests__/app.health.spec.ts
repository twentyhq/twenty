import { HealthIndicatorService } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';

import { AppHealthIndicator } from 'src/engine/core-modules/health/indicators/app.health';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';

describe('AppHealthIndicator', () => {
  let service: AppHealthIndicator;
  let objectMetadataService: jest.Mocked<ObjectMetadataService>;
  let workspaceMigrationService: jest.Mocked<WorkspaceMigrationService>;
  let healthIndicatorService: jest.Mocked<HealthIndicatorService>;

  beforeEach(async () => {
    objectMetadataService = {
      findMany: jest.fn(),
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

  describe('distributed sampling', () => {
    it('should return all workspaces when count is less than sample size', async () => {
      objectMetadataService.findMany.mockResolvedValue([
        { id: '1', workspaceId: 'workspace1' } as any,
        { id: '2', workspaceId: 'workspace2' } as any,
      ]);
      workspaceMigrationService.getPendingMigrations.mockResolvedValue([]);

      const result = await service.isHealthy();

      expect(result.app.details.overview.totalWorkspacesCount).toBe(2);
      expect(result.app.details.overview.checkedWorkspacesCount).toBe(2);
    });

    it('should handle distributed sampling for large number of workspaces', async () => {
      // Create 200 unique workspaces
      const workspaces = Array.from({ length: 200 }, (_, i) => ({
        id: `${i}`,
        workspaceId: `workspace${i}`,
      }));

      objectMetadataService.findMany.mockResolvedValue(workspaces as any);
      workspaceMigrationService.getPendingMigrations.mockResolvedValue([]);

      const result = await service.isHealthy();

      // Should sample 100 workspaces total
      expect(result.app.details.overview.totalWorkspacesCount).toBe(200);
      expect(result.app.details.overview.checkedWorkspacesCount).toBe(100);
    });

    it('should handle duplicate workspace IDs correctly', async () => {
      // Create workspaces with duplicate IDs
      const workspaces = [
        { id: '1', workspaceId: 'workspace1' },
        { id: '2', workspaceId: 'workspace1' }, // Duplicate
        { id: '3', workspaceId: 'workspace2' },
        { id: '4', workspaceId: 'workspace2' }, // Duplicate
      ];

      objectMetadataService.findMany.mockResolvedValue(workspaces as any);
      workspaceMigrationService.getPendingMigrations.mockResolvedValue([]);

      const result = await service.isHealthy();

      // Should count unique workspace IDs
      expect(result.app.details.overview.totalWorkspacesCount).toBe(2);
      expect(result.app.details.overview.checkedWorkspacesCount).toBe(2);
    });

    it('should maintain distribution ratios for large workspaces', async () => {
      // Create 1000 workspaces to test distribution
      const workspaces = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i}`,
        workspaceId: `workspace${i}`,
      }));

      objectMetadataService.findMany.mockResolvedValue(workspaces as any);
      workspaceMigrationService.getPendingMigrations.mockResolvedValue([]);

      const result = await service.isHealthy();

      // Total sampled should be close to 100 (might be 99 due to Math.floor)
      expect(
        result.app.details.overview.checkedWorkspacesCount,
      ).toBeGreaterThanOrEqual(99);
      expect(
        result.app.details.overview.checkedWorkspacesCount,
      ).toBeLessThanOrEqual(100);

      // Total count should be accurate
      expect(result.app.details.overview.totalWorkspacesCount).toBe(1000);
    });
  });
});
