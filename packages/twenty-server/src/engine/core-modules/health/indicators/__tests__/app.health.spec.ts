import { HealthIndicatorService } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';

import { WorkspaceHealthIssueType } from 'src/engine/workspace-manager/workspace-health/interfaces/workspace-health-issue.interface';

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
        standardId: 'std1',
        dataSourceId: 'ds1',
        nameSingular: 'test',
        workspaceId: 'workspace1',
      } as any,
      {
        id: '2',
        standardId: 'std2',
        dataSourceId: 'ds2',
        nameSingular: 'test',
        workspaceId: 'workspace2',
      } as any,
    ]);

    workspaceHealthService.healthCheck.mockResolvedValue([]);
    workspaceMigrationService.getPendingMigrations.mockResolvedValue([]);

    const result = await service.isHealthy();

    expect(result.app.status).toBe('up');
    expect(result.app.details.workspaces.totalWorkspaces).toBe(2);
    expect(result.app.details.workspaces.healthStatus).toHaveLength(2);
    expect(result.app.details.workspaces.healthStatus[0].severity).toBe(
      'healthy',
    );
  });

  it('should return down status when there are pending migrations', async () => {
    objectMetadataService.findMany.mockResolvedValue([
      {
        id: '1',
        standardId: 'std1',
        dataSourceId: 'ds1',
        nameSingular: 'test',
        workspaceId: 'workspace1',
      } as any,
    ]);

    workspaceHealthService.healthCheck.mockResolvedValue([]);
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
    expect(result.app.details.workspaces.healthStatus[0].severity).toBe(
      'critical',
    );
  });

  it('should categorize health issues correctly', async () => {
    objectMetadataService.findMany.mockResolvedValue([
      {
        id: '1',
        standardId: 'std1',
        dataSourceId: 'ds1',
        nameSingular: 'test',
        workspaceId: 'workspace1',
      } as any,
    ]);

    workspaceHealthService.healthCheck.mockResolvedValue([
      {
        type: WorkspaceHealthIssueType.MISSING_TABLE,
        message: 'Table missing',
        objectMetadata: {
          id: '1',
          nameSingular: 'test',
        } as any,
      },
      {
        type: WorkspaceHealthIssueType.MISSING_COLUMN,
        message: 'Column missing',
        fieldMetadata: {
          id: '1',
          nameSingular: 'test',
        } as any,
      },
      {
        type: WorkspaceHealthIssueType.RELATION_TYPE_NOT_VALID,
        message: 'Invalid relation',
      },
    ]);
    workspaceMigrationService.getPendingMigrations.mockResolvedValue([]);

    const result = await service.isHealthy();

    expect(result.app.details.workspaces.healthStatus[0].summary).toEqual({
      structuralIssues: 1,
      dataIssues: 1,
      relationshipIssues: 1,
      pendingMigrations: 0,
    });
  });

  it('should handle errors gracefully', async () => {
    objectMetadataService.findMany.mockRejectedValue(
      new Error('Database connection failed'),
    );

    const result = await service.isHealthy();

    expect(result.app.status).toBe('down');
    expect(result.app.error).toBeDefined();
    expect(result.app.system.nodeVersion).toBeDefined();
  });
});
