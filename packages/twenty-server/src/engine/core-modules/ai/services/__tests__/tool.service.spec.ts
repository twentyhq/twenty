import { Test } from '@nestjs/testing';

import { ToolService } from 'src/engine/core-modules/ai/services/tool.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';
import { RecordInputTransformerService } from 'src/engine/core-modules/record-transformer/services/record-input-transformer.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { getMockObjectMetadataEntity } from 'src/utils/__test__/get-object-metadata-entity.mock';

// Minimal mock repository type
const createMockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  delete: jest.fn(),
  remove: jest.fn(),
});

describe('ToolService', () => {
  const workspaceId = 'ws_1';
  const roleId = 'role_1';

  let service: ToolService;
  let ormManager: TwentyORMGlobalManager;
  let permissionsCacheService: WorkspacePermissionsCacheService;
  let transformer: RecordInputTransformerService;
  let workspaceCache: WorkspaceCacheStorageService;

  const testObject = getMockObjectMetadataEntity({
    workspaceId: '',
    id: 'obj_1',
    nameSingular: 'testObject',
    namePlural: 'testObjects',
    labelSingular: 'Test Object',
    labelPlural: 'Test Objects',
    isActive: true,
    isSystem: false,
    fields: [],
  });

  const mockRepo = createMockRepository();

  beforeEach(async () => {
    jest.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        ToolService,
        {
          provide: TwentyORMGlobalManager,
          useValue: {
            getRepositoryForWorkspace: jest.fn().mockResolvedValue(mockRepo),
          },
        },
        {
          provide: ObjectMetadataService,
          useValue: {
            findManyWithinWorkspace: jest.fn().mockResolvedValue([testObject]),
          },
        },
        {
          provide: WorkspacePermissionsCacheService,
          useValue: {
            getRolesPermissionsFromCache: jest.fn().mockResolvedValue({
              data: {
                [roleId]: {
                  [testObject.id]: {
                    canRead: true,
                    canUpdate: true,
                    canSoftDelete: true,
                    canDestroy: false,
                    restrictedFields: {},
                  },
                },
              },
            }),
          },
        },
        {
          provide: RecordInputTransformerService,
          useValue: {
            process: jest.fn(async ({ recordInput }) => recordInput),
          },
        },
        {
          provide: WorkspaceCacheStorageService,
          useValue: {
            getObjectMetadataMapsOrThrow: jest.fn().mockResolvedValue({
              byId: {
                [testObject.id]: {
                  ...testObject,
                  fieldsById: {},
                  fieldIdByJoinColumnName: {},
                  fieldIdByName: {},
                  indexMetadatas: [],
                },
              },
              idByNameSingular: { [testObject.nameSingular]: testObject.id },
            }),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(ToolService);
    ormManager = moduleRef.get(TwentyORMGlobalManager);
    permissionsCacheService = moduleRef.get(WorkspacePermissionsCacheService);
    transformer = moduleRef.get(RecordInputTransformerService);
    workspaceCache = moduleRef.get(WorkspaceCacheStorageService);
  });

  describe('listTools', () => {
    it('should return tools based on role permissions', async () => {
      const tools = await service.listTools(roleId, workspaceId);

      expect(
        permissionsCacheService.getRolesPermissionsFromCache,
      ).toHaveBeenCalledWith({ workspaceId });

      // Verify tool keys
      expect(tools['create_testObject']).toBeDefined();
      expect(tools['update_testObject']).toBeDefined();
      expect(tools['find_testObject']).toBeDefined();
      expect(tools['find_one_testObject']).toBeDefined();
      expect(tools['soft_delete_testObject']).toBeDefined();
      expect(tools['soft_delete_many_testObject']).toBeDefined();

      // Ensure the execute functions are wired
      expect(typeof tools['create_testObject'].execute).toBe('function');
    });
  });

  describe('createRecord', () => {
    it('should create a record successfully', async () => {
      const record = { id: 'r1', name: 'Test' };

      mockRepo.save.mockResolvedValue(record);

      const result = await service.createRecord(
        'testObject',
        { name: 'Test' },
        workspaceId,
        roleId,
      );

      expect(result.success).toBe(true);
      expect(result.record).toEqual(record);
      expect(ormManager.getRepositoryForWorkspace).toHaveBeenCalledWith(
        workspaceId,
        'testObject',
        { roleId },
      );
      expect(workspaceCache.getObjectMetadataMapsOrThrow).toHaveBeenCalledWith(
        workspaceId,
      );
      expect(transformer.process).toHaveBeenCalled();
      expect(mockRepo.save).toHaveBeenCalledWith({ name: 'Test' });
    });
  });

  describe('updateRecord', () => {
    it('should return error when id is missing', async () => {
      const result = await (service as any).updateRecord(
        'testObject',
        { name: 'No ID' },
        workspaceId,
        roleId,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Record ID is required for update');
    });
  });

  describe('findRecords', () => {
    it('should return records and count', async () => {
      const records = [{ id: 'a' }, { id: 'b' }];

      mockRepo.find.mockResolvedValue(records);

      const result = await (service as any).findRecords(
        'testObject',
        {},
        workspaceId,
        roleId,
      );

      expect(result.success).toBe(true);
      expect(result.records).toEqual(records);
      expect(result.count).toBe(2);
      expect(mockRepo.find).toHaveBeenCalled();
    });
  });

  describe('softDeleteManyRecords', () => {
    it('should error when filter is invalid', async () => {
      const result = await (service as any).softDeleteManyRecords(
        'testObject',
        {},
        workspaceId,
        roleId,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        'Filter with record IDs is required for bulk soft delete',
      );
    });
  });
});
