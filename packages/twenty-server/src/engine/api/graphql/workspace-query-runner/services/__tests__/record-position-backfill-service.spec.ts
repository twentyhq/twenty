import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { FieldMetadataType } from 'twenty-shared/types';

import { RecordPositionBackfillService } from 'src/engine/api/graphql/workspace-query-runner/services/record-position-backfill-service';
import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';

describe('RecordPositionBackfillService', () => {
  let recordPositionService;
  let objectMetadataRepository;
  let workspaceDataSourceService;

  let service: RecordPositionBackfillService;

  beforeEach(async () => {
    recordPositionService = {
      buildRecordPosition: jest.fn().mockResolvedValue([
        {
          position: 1,
        },
      ]),
    };

    objectMetadataRepository = {
      find: jest.fn().mockReturnValue([]),
    };

    workspaceDataSourceService = {
      getSchemaName: jest.fn().mockReturnValue('schemaName'),
      executeRawQuery: jest.fn().mockResolvedValue([]),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordPositionBackfillService,
        {
          provide: RecordPositionService,
          useValue: recordPositionService,
        },
        {
          provide: WorkspaceDataSourceService,
          useValue: workspaceDataSourceService,
        },
        {
          provide: getRepositoryToken(ObjectMetadataEntity, 'metadata'),
          useValue: objectMetadataRepository,
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
    objectMetadataRepository.find.mockReturnValue([]);
    await service.backfill('workspaceId', false);
    expect(workspaceDataSourceService.executeRawQuery).not.toHaveBeenCalled();
  });

  it('when objectMetadata but all record with position, should create and run query once', async () => {
    objectMetadataRepository.find.mockReturnValue([
      {
        id: '1',
        nameSingular: 'company',
        fields: [
          {
            type: FieldMetadataType.POSITION,
            isCustom: true,
            nameSingular: 'position',
          },
        ],
      },
    ]);
    await service.backfill('workspaceId', false);
    expect(workspaceDataSourceService.executeRawQuery).toHaveBeenCalledTimes(1);
  });

  it('when record without position, should create and run query twice', async () => {
    objectMetadataRepository.find.mockReturnValue([
      {
        id: '1',
        nameSingular: 'company',
        fields: [
          {
            type: FieldMetadataType.POSITION,
            isCustom: true,
            nameSingular: 'position',
          },
        ],
      },
    ]);
    workspaceDataSourceService.executeRawQuery.mockResolvedValueOnce([
      {
        id: '1',
      },
    ]);
    await service.backfill('workspaceId', false);
    expect(workspaceDataSourceService.executeRawQuery).toHaveBeenCalledTimes(2);
    expect(recordPositionService.buildRecordPosition).toHaveBeenCalledTimes(1);
  });

  it('when dryRun is true, should not update position', async () => {
    objectMetadataRepository.find.mockReturnValue([
      {
        id: '1',
        nameSingular: 'company',
        fields: [
          {
            type: FieldMetadataType.POSITION,
            isCustom: true,
            nameSingular: 'position',
          },
        ],
      },
    ]);
    workspaceDataSourceService.executeRawQuery.mockResolvedValueOnce([
      {
        id: '1',
      },
    ]);
    await service.backfill('workspaceId', true);
    expect(workspaceDataSourceService.executeRawQuery).toHaveBeenCalledTimes(1);
    expect(recordPositionService.buildRecordPosition).toHaveBeenCalledTimes(1);
  });
});
