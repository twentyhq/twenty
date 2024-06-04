import { TestingModule, Test } from '@nestjs/testing';

import { RecordPositionQueryFactory } from 'src/engine/api/graphql/workspace-query-builder/factories/record-position-query.factory';
import { RecordPositionFactory } from 'src/engine/api/graphql/workspace-query-runner/factories/record-position.factory';
import { RecordPositionBackfillService } from 'src/engine/api/graphql/workspace-query-runner/services/record-position-backfill-service';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';

describe('RecordPositionBackfillService', () => {
  let recordPositionQueryFactory;
  let recordPositionFactory;
  let objectMetadataService;
  let workspaceDataSourceService;

  let service: RecordPositionBackfillService;

  beforeEach(async () => {
    recordPositionQueryFactory = {
      create: jest.fn().mockReturnValue(['query', []]),
    };

    recordPositionFactory = {
      create: jest.fn().mockResolvedValue([
        {
          position: 1,
        },
      ]),
    };

    objectMetadataService = {
      findManyWithinWorkspace: jest.fn().mockReturnValue([]),
    };

    workspaceDataSourceService = {
      getSchemaName: jest.fn().mockReturnValue('schemaName'),
      executeRawQuery: jest.fn().mockResolvedValue([]),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordPositionBackfillService,
        {
          provide: RecordPositionQueryFactory,
          useValue: recordPositionQueryFactory,
        },
        {
          provide: RecordPositionFactory,
          useValue: recordPositionFactory,
        },
        {
          provide: WorkspaceDataSourceService,
          useValue: workspaceDataSourceService,
        },
        {
          provide: ObjectMetadataService,
          useValue: objectMetadataService,
        },
      ],
    }).compile();

    service = module.get<RecordPositionBackfillService>(
      RecordPositionBackfillService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('when no object metadata found, should do nothing', async () => {
    await service.backfill('workspaceId', false);
    expect(workspaceDataSourceService.executeRawQuery).not.toHaveBeenCalled();
  });

  it('when objectMetadata without position, should do nothing', async () => {
    objectMetadataService.findManyWithinWorkspace.mockReturnValue([
      {
        id: '1',
        nameSingular: 'name',
        fields: [],
      },
    ]);
    await service.backfill('workspaceId', false);
    expect(workspaceDataSourceService.executeRawQuery).not.toHaveBeenCalled();
  });

  it('when objectMetadata but all record with position, should create and run query once', async () => {
    objectMetadataService.findManyWithinWorkspace.mockReturnValue([
      {
        id: '1',
        nameSingular: 'company',
        fields: [],
      },
    ]);
    await service.backfill('workspaceId', false);
    expect(workspaceDataSourceService.executeRawQuery).toHaveBeenCalledTimes(1);
  });

  it('when record without position, should create and run query twice', async () => {
    objectMetadataService.findManyWithinWorkspace.mockReturnValue([
      {
        id: '1',
        nameSingular: 'company',
        fields: [],
      },
    ]);
    workspaceDataSourceService.executeRawQuery.mockResolvedValueOnce([
      {
        id: '1',
      },
    ]);
    await service.backfill('workspaceId', false);
    expect(workspaceDataSourceService.executeRawQuery).toHaveBeenCalledTimes(2);
    expect(recordPositionFactory.create).toHaveBeenCalledTimes(1);
    expect(recordPositionQueryFactory.create).toHaveBeenCalledTimes(2);
  });

  it('when dryRun is true, should not update position', async () => {
    objectMetadataService.findManyWithinWorkspace.mockReturnValue([
      {
        id: '1',
        nameSingular: 'company',
        fields: [],
      },
    ]);
    workspaceDataSourceService.executeRawQuery.mockResolvedValueOnce([
      {
        id: '1',
      },
    ]);
    await service.backfill('workspaceId', true);
    expect(workspaceDataSourceService.executeRawQuery).toHaveBeenCalledTimes(1);
    expect(recordPositionFactory.create).toHaveBeenCalledTimes(1);
    expect(recordPositionQueryFactory.create).toHaveBeenCalledTimes(1);
  });
});
