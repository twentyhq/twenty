import { Test, type TestingModule } from '@nestjs/testing';

import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

describe('RecordPositionService', () => {
  let globalWorkspaceOrmManager: jest.Mocked<GlobalWorkspaceOrmManager>;
  let mockRepository: any;
  let service: RecordPositionService;

  beforeEach(async () => {
    mockRepository = {
      findOneBy: jest.fn(),
      update: jest.fn(),
      minimum: jest.fn().mockResolvedValue(1),
      maximum: jest.fn().mockResolvedValue(1),
    };

    globalWorkspaceOrmManager = {
      getRepository: jest.fn().mockResolvedValue(mockRepository),
      executeInWorkspaceContext: jest
        .fn()
        .mockImplementation((_authContext: any, fn: () => any) => fn()),
    } as unknown as jest.Mocked<GlobalWorkspaceOrmManager>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordPositionService,
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: globalWorkspaceOrmManager,
        },
      ],
    }).compile();

    service = module.get<RecordPositionService>(RecordPositionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buildRecordPosition', () => {
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
