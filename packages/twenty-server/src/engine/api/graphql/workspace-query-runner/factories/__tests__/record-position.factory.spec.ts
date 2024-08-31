import { Test, TestingModule } from '@nestjs/testing';

import { RecordPositionQueryFactory } from 'src/engine/api/graphql/workspace-query-builder/factories/record-position-query.factory';
import { RecordPositionFactory } from 'src/engine/api/graphql/workspace-query-runner/factories/record-position.factory';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';

describe('RecordPositionFactory', () => {
  const recordPositionQueryFactory = {
    create: jest.fn().mockReturnValue(['query', []]),
  };

  let workspaceDataSourceService;

  let factory: RecordPositionFactory;

  beforeEach(async () => {
    workspaceDataSourceService = {
      getSchemaName: jest.fn().mockReturnValue('schemaName'),
      executeRawQuery: jest.fn().mockResolvedValue([{ position: 1 }]),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordPositionFactory,
        {
          provide: RecordPositionQueryFactory,
          useValue: recordPositionQueryFactory,
        },
        {
          provide: WorkspaceDataSourceService,
          useValue: workspaceDataSourceService,
        },
      ],
    }).compile();

    factory = module.get<RecordPositionFactory>(RecordPositionFactory);
  });

  it('should be defined', () => {
    expect(factory).toBeDefined();
  });

  describe('create', () => {
    const objectMetadata = { isCustom: false, nameSingular: 'company' };
    const workspaceId = 'workspaceId';

    it('should return the value when value is a number', async () => {
      const value = 1;

      const result = await factory.create(value, objectMetadata, workspaceId);

      expect(result).toEqual(value);
    });

    it('should return the existing position -1 when value is first', async () => {
      const value = 'first';
      const result = await factory.create(value, objectMetadata, workspaceId);

      expect(result).toEqual(0);
    });

    it('should return the existing position + 1 when value is last', async () => {
      const value = 'last';
      const result = await factory.create(value, objectMetadata, workspaceId);

      expect(result).toEqual(2);
    });
  });
});
