import { Test } from '@nestjs/testing';

import { ToolService } from 'src/engine/metadata-modules/ai-tools/services/tool.service';
import { CreateRecordService } from 'src/engine/core-modules/record-crud/services/create-record.service';
import { DeleteRecordService } from 'src/engine/core-modules/record-crud/services/delete-record.service';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { UpdateRecordService } from 'src/engine/core-modules/record-crud/services/update-record.service';
import { RecordInputTransformerService } from 'src/engine/core-modules/record-transformer/services/record-input-transformer.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
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
  let permissionsCacheService: WorkspacePermissionsCacheService;

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
          provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
          useValue: {
            getOrRecomputeManyOrAllFlatEntityMaps: jest.fn().mockResolvedValue({
              flatObjectMetadataMaps: {
                byId: {
                  [testObject.id]: {
                    ...testObject,
                    fieldMetadataIds: [],
                  },
                },
              },
              flatFieldMetadataMaps: {
                byId: {},
              },
            }),
          },
        },
        {
          provide: WorkspacePermissionsCacheService,
          useValue: {
            getRolesPermissionsFromCache: jest.fn().mockResolvedValue({
              data: {
                [roleId]: {
                  [testObject.id]: {
                    canReadObjectRecords: true,
                    canUpdateObjectRecords: true,
                    canSoftDeleteObjectRecords: true,
                    canDestroyObjectRecords: false,
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
        {
          provide: CreateRecordService,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateRecordService,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeleteRecordService,
          useValue: { execute: jest.fn() },
        },
        {
          provide: FindRecordsService,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    service = moduleRef.get(ToolService);
    permissionsCacheService = moduleRef.get(WorkspacePermissionsCacheService);
  });

  describe('listTools', () => {
    it('should return tools based on role permissions', async () => {
      const tools = await service.listTools({ unionOf: [roleId] }, workspaceId);

      expect(
        permissionsCacheService.getRolesPermissionsFromCache,
      ).toHaveBeenCalledWith({ workspaceId });

      // Verify tool keys
      expect(tools['create_testObject']).toBeDefined();
      expect(tools['update_testObject']).toBeDefined();
      expect(tools['find_testObject']).toBeDefined();
      expect(tools['soft_delete_testObject']).toBeDefined();
      expect(tools['soft_delete_many_testObject']).toBeDefined();

      // Ensure the execute functions are wired
      expect(typeof tools['create_testObject'].execute).toBe('function');
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
