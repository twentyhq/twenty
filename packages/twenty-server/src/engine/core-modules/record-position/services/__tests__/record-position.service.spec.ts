import { Test, TestingModule } from '@nestjs/testing';

import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';

describe('RecordPositionService', () => {
  let workspaceDataSourceService;

  let service: RecordPositionService;

  beforeEach(async () => {
    workspaceDataSourceService = {
      getSchemaName: jest.fn().mockReturnValue('schemaName'),
      executeRawQuery: jest.fn().mockResolvedValue([{ position: 1 }]),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordPositionService,
        {
          provide: WorkspaceDataSourceService,
          useValue: workspaceDataSourceService,
        },
      ],
    }).compile();

    service = module.get<RecordPositionService>(RecordPositionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const objectMetadata = { isCustom: false, nameSingular: 'company' };
    const workspaceId = 'workspaceId';

    it('should return the value when value is a number', async () => {
      const value = 1;

      const result = await service.buildRecordPosition({
        value,
        objectMetadata,
        workspaceId,
      });

      expect(result).toEqual(value);
    });

    it('should return the existing position -1 when value is first', async () => {
      const value = 'first';
      const result = await service.buildRecordPosition({
        value,
        objectMetadata,
        workspaceId,
      });

      expect(result).toEqual(0);
    });

    it('should return the existing position + 1 when value is last', async () => {
      const value = 'last';
      const result = await service.buildRecordPosition({
        value,
        objectMetadata,
        workspaceId,
      });

      expect(result).toEqual(2);
    });
  });
});
