import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type ObjectsPermissionsByRoleId } from 'twenty-shared/types';
import { type Repository } from 'typeorm';

import {
  fieldRelationMock,
  fieldTextMock,
  objectMetadataItemMock,
} from 'src/engine/api/__mocks__/object-metadata-item.mock';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type UpsertFieldPermissionsInput } from 'src/engine/metadata-modules/object-permission/dtos/upsert-field-permissions.input';
import { FieldPermissionEntity } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.entity';
import { FieldPermissionService } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.service';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { getMockFieldMetadataEntity } from 'src/utils/__test__/get-field-metadata-entity.mock';

const emptyFlatFieldPermissionMaps = {
  byUniversalIdentifier: {},
  universalIdentifierById: {},
  byId: {},
  idByUniversalIdentifier: {},
  universalIdentifiersByApplicationId: {},
};

describe('FieldPermissionService', () => {
  let service: FieldPermissionService;
  let fieldPermissionsRepository: jest.Mocked<
    Repository<FieldPermissionEntity>
  >;
  let roleRepository: jest.Mocked<Repository<RoleEntity>>;
  let fieldMetadataRepository: jest.Mocked<Repository<FieldMetadataEntity>>;
  let workspaceCacheService: jest.Mocked<WorkspaceCacheService>;
  let workspaceManyOrAllFlatEntityMapsCacheService: jest.Mocked<WorkspaceManyOrAllFlatEntityMapsCacheService>;
  let workspaceMigrationValidateBuildAndRunService: jest.Mocked<WorkspaceMigrationValidateBuildAndRunService>;
  let flatRoleMaps: {
    byUniversalIdentifier: Record<
      string,
      { id: string; isEditable: boolean; universalIdentifier: string }
    >;
    universalIdentifierById: Record<string, string>;
    byId: Record<string, unknown>;
    idByUniversalIdentifier: Record<string, string>;
    universalIdentifiersByApplicationId: Record<string, string[]>;
  };

  const testWorkspaceId = '20202020-0000-0000-0000-000000000000';
  const testRoleId = '20202020-0000-0000-0000-000000000001';
  const testObjectMetadataId = '20202020-0000-0000-0000-000000000002';
  const testFieldMetadataId = fieldTextMock.id;

  const mockRole: RoleEntity = {
    id: testRoleId,
    label: 'Test Role',
    description: 'Test role for unit tests',
    canUpdateAllSettings: false,
    canReadAllObjectRecords: true,
    canUpdateAllObjectRecords: false,
    canSoftDeleteAllObjectRecords: false,
    canDestroyAllObjectRecords: false,
    workspaceId: testWorkspaceId,
    createdAt: new Date(),
    updatedAt: new Date(),
    isEditable: true,
  } as RoleEntity;

  const mockRolesPermissions: ObjectsPermissionsByRoleId = {
    [testRoleId]: {
      [testObjectMetadataId]: {
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
        restrictedFields: {},
        rowLevelPermissionPredicates: [],
        rowLevelPermissionPredicateGroups: [],
      },
      [fieldRelationMock.objectMetadataId]: {
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
        restrictedFields: {},
        rowLevelPermissionPredicates: [],
        rowLevelPermissionPredicateGroups: [],
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FieldPermissionService,
        {
          provide: getRepositoryToken(RoleEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(FieldPermissionEntity),
          useValue: {
            find: jest.fn(),
            upsert: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: WorkspaceCacheService,
          useValue: {
            getOrRecompute: jest.fn(),
            invalidate: jest.fn(),
            invalidateAndRecompute: jest.fn(),
          },
        },
        {
          provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
          useValue: {
            getOrRecomputeManyOrAllFlatEntityMaps: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(FieldMetadataEntity),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: ApplicationService,
          useValue: {
            findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
              .fn()
              .mockResolvedValue({
                workspaceCustomFlatApplication: {
                  id: 'app-id',
                  universalIdentifier: 'app-universal-id',
                },
              }),
          },
        },
        {
          provide: WorkspaceMigrationValidateBuildAndRunService,
          useValue: {
            validateBuildAndRunWorkspaceMigration: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FieldPermissionService>(FieldPermissionService);
    workspaceMigrationValidateBuildAndRunService = module.get(
      WorkspaceMigrationValidateBuildAndRunService,
    );
    fieldPermissionsRepository = module.get(
      getRepositoryToken(FieldPermissionEntity),
    );
    roleRepository = module.get(getRepositoryToken(RoleEntity));
    fieldMetadataRepository = module.get(
      getRepositoryToken(FieldMetadataEntity),
    );
    workspaceCacheService = module.get(WorkspaceCacheService);
    workspaceManyOrAllFlatEntityMapsCacheService = module.get(
      WorkspaceManyOrAllFlatEntityMapsCacheService,
    );

    // Setup default mocks
    roleRepository.findOne.mockResolvedValue(mockRole);
    fieldMetadataRepository.find.mockResolvedValue([
      fieldTextMock,
      fieldRelationMock,
    ]);
    (workspaceCacheService.getOrRecompute as jest.Mock).mockImplementation(
      (_workspaceId: string, keys: string[]) => {
        if (keys?.includes('flatFieldPermissionMaps')) {
          return Promise.resolve({
            flatFieldPermissionMaps: emptyFlatFieldPermissionMaps,
          });
        }
        if (keys?.includes('rolesPermissions')) {
          return Promise.resolve({ rolesPermissions: mockRolesPermissions });
        }
        return Promise.resolve({});
      },
    );
    const testFieldMetadata = getMockFieldMetadataEntity({
      ...fieldTextMock,
      label: 'Test Field',
      objectMetadataId: testObjectMetadataId,
      workspaceId: testWorkspaceId,
      id: testFieldMetadataId,
    });

    flatRoleMaps = {
      byUniversalIdentifier: {
        [testRoleId]: {
          id: testRoleId,
          isEditable: true,
          universalIdentifier: testRoleId,
        },
      },
      universalIdentifierById: { [testRoleId]: testRoleId },
      byId: {},
      idByUniversalIdentifier: {},
      universalIdentifiersByApplicationId: {},
    };
    workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue(
      {
        flatRoleMaps,
        flatObjectMetadataMaps: {
          byUniversalIdentifier: {
            [testObjectMetadataId]: {
              ...objectMetadataItemMock,
              id: testObjectMetadataId,
              fieldIds: [testFieldMetadataId],
              indexMetadataIds: [],
              viewIds: [],
              universalIdentifier: testObjectMetadataId,
              applicationId: null,
            } as any,
            [fieldRelationMock.objectMetadataId]: {
              ...objectMetadataItemMock,
              id: fieldRelationMock.objectMetadataId,
              fieldIds: [fieldRelationMock.id],
              indexMetadataIds: [],
              viewIds: [],
              universalIdentifier: fieldRelationMock.objectMetadataId,
              applicationId: null,
            } as any,
            [fieldRelationMock.relationTargetObjectMetadataId!]: {
              ...objectMetadataItemMock,
              id: fieldRelationMock.relationTargetObjectMetadataId,
              fieldIds: [fieldRelationMock.relationTargetFieldMetadataId!],
              indexMetadataIds: [],
              viewIds: [],
              universalIdentifier:
                fieldRelationMock.relationTargetObjectMetadataId,
              applicationId: null,
            } as any,
          },
          universalIdentifierById: {
            [testObjectMetadataId]: testObjectMetadataId,
            [fieldRelationMock.objectMetadataId]:
              fieldRelationMock.objectMetadataId,
            [fieldRelationMock.relationTargetObjectMetadataId!]:
              fieldRelationMock.relationTargetObjectMetadataId!,
          },
          universalIdentifiersByApplicationId: {},
        },
        flatFieldMetadataMaps: {
          byUniversalIdentifier: {
            [testFieldMetadata.universalIdentifier]: testFieldMetadata as any,
            [fieldRelationMock.universalIdentifier]: fieldRelationMock as any,
            [fieldRelationMock.relationTargetFieldMetadataId!]: {
              ...fieldRelationMock,
              id: fieldRelationMock.relationTargetFieldMetadataId,
              universalIdentifier:
                fieldRelationMock.relationTargetFieldMetadataId,
            } as any,
          },
          universalIdentifierById: {
            [testFieldMetadataId]: testFieldMetadata.universalIdentifier,
            [fieldRelationMock.id]: fieldRelationMock.universalIdentifier,
            [fieldRelationMock.relationTargetFieldMetadataId!]:
              fieldRelationMock.relationTargetFieldMetadataId!,
          },
          universalIdentifiersByApplicationId: {},
        },
      } as any,
    );
    fieldPermissionsRepository.find.mockResolvedValue([]);
    fieldPermissionsRepository.upsert.mockResolvedValue({} as any);
    fieldPermissionsRepository.delete.mockResolvedValue({} as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('upsertFieldPermissions', () => {
    const createUpsertInput = (
      fieldPermissions: {
        canReadFieldValue?: boolean | null;
        canUpdateFieldValue?: boolean | null;
        objectMetadataId?: string;
        fieldMetadataId?: string;
      }[],
    ): UpsertFieldPermissionsInput => ({
      roleId: testRoleId,
      fieldPermissions: fieldPermissions.map((fieldPermission) => ({
        objectMetadataId: testObjectMetadataId,
        fieldMetadataId: testFieldMetadataId,
        ...fieldPermission,
      })),
    });

    describe('successful cases', () => {
      it('should successfully upsert field permissions', async () => {
        workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration.mockResolvedValue(
          { status: 'success' } as any,
        );

        const input = createUpsertInput([
          {
            canReadFieldValue: false,
            canUpdateFieldValue: false,
          },
        ]);

        const result = await service.upsertFieldPermissions({
          workspaceId: testWorkspaceId,
          input,
        });

        expect(
          workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            workspaceId: testWorkspaceId,
            isSystemBuild: false,
            allFlatEntityOperationByMetadataName: expect.objectContaining({
              fieldPermission: expect.objectContaining({
                flatEntityToCreate: expect.any(Array),
                flatEntityToUpdate: expect.any(Array),
                flatEntityToDelete: expect.any(Array),
              }),
            }),
          }),
        );
        expect(result).toEqual(expect.any(Array));
        expect(
          workspaceCacheService.invalidateAndRecompute,
        ).toHaveBeenCalledWith(testWorkspaceId, ['rolesPermissions']);
      });

      it('should delete field permissions when both canReadFieldValue and canUpdateFieldValue are null', async () => {
        const existingUniversalId = 'existing-fp-universal-id';
        const mapsWithOneCurrentPermission = {
          ...emptyFlatFieldPermissionMaps,
          byUniversalIdentifier: {
            [existingUniversalId]: {
              id: 'existing-fp-id',
              universalIdentifier: existingUniversalId,
              roleUniversalIdentifier: testRoleId,
              objectMetadataId: testObjectMetadataId,
              fieldMetadataId: testFieldMetadataId,
              canReadFieldValue: undefined,
              canUpdateFieldValue: false,
              applicationUniversalIdentifier: 'app-ui',
              objectMetadataUniversalIdentifier: testObjectMetadataId,
              fieldMetadataUniversalIdentifier: testFieldMetadataId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
          universalIdentifierById: { 'existing-fp-id': existingUniversalId },
        };
        let flatFieldPermissionMapsCallCount = 0;
        (workspaceCacheService.getOrRecompute as jest.Mock).mockImplementation(
          (_w: string, keys: string[]) => {
            if (keys?.includes('flatFieldPermissionMaps')) {
              flatFieldPermissionMapsCallCount += 1;
              return Promise.resolve({
                flatFieldPermissionMaps:
                  flatFieldPermissionMapsCallCount === 1
                    ? mapsWithOneCurrentPermission
                    : emptyFlatFieldPermissionMaps,
              });
            }
            if (keys?.includes('rolesPermissions')) {
              return Promise.resolve({
                rolesPermissions: mockRolesPermissions,
              });
            }
            return Promise.resolve({});
          },
        );
        workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration.mockResolvedValue(
          { status: 'success' } as any,
        );

        const input = createUpsertInput([
          {
            canReadFieldValue: null,
            canUpdateFieldValue: null,
          },
        ]);

        await service.upsertFieldPermissions({
          workspaceId: testWorkspaceId,
          input,
        });

        expect(
          workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            allFlatEntityOperationByMetadataName: expect.objectContaining({
              fieldPermission: expect.objectContaining({
                flatEntityToDelete: expect.arrayContaining([
                  expect.objectContaining({
                    universalIdentifier: existingUniversalId,
                  }),
                ]),
              }),
            }),
          }),
        );
      });

      it('should not delete field permissions when one value is null and the other is false', async () => {
        const existingUniversalId = 'existing-fp-ui-2';
        const mapsWithOneCurrent = {
          ...emptyFlatFieldPermissionMaps,
          byUniversalIdentifier: {
            [existingUniversalId]: {
              id: 'existing-fp-id-2',
              universalIdentifier: existingUniversalId,
              roleUniversalIdentifier: testRoleId,
              objectMetadataId: testObjectMetadataId,
              fieldMetadataId: testFieldMetadataId,
              canReadFieldValue: false,
              canUpdateFieldValue: undefined,
              applicationUniversalIdentifier: 'app-ui',
              objectMetadataUniversalIdentifier: testObjectMetadataId,
              fieldMetadataUniversalIdentifier: testFieldMetadataId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
          universalIdentifierById: { 'existing-fp-id-2': existingUniversalId },
        };
        let flatMapsCallCount = 0;
        (workspaceCacheService.getOrRecompute as jest.Mock).mockImplementation(
          (_w: string, keys: string[]) => {
            if (keys?.includes('flatFieldPermissionMaps')) {
              flatMapsCallCount += 1;
              return Promise.resolve({
                flatFieldPermissionMaps:
                  flatMapsCallCount === 1
                    ? mapsWithOneCurrent
                    : emptyFlatFieldPermissionMaps,
              });
            }
            if (keys?.includes('rolesPermissions')) {
              return Promise.resolve({
                rolesPermissions: mockRolesPermissions,
              });
            }
            return Promise.resolve({});
          },
        );
        workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration.mockResolvedValue(
          { status: 'success' } as any,
        );

        const input = createUpsertInput([
          {
            canUpdateFieldValue: false,
            canReadFieldValue: null,
          },
        ]);

        await service.upsertFieldPermissions({
          workspaceId: testWorkspaceId,
          input,
        });

        const callArg = workspaceMigrationValidateBuildAndRunService
          .validateBuildAndRunWorkspaceMigration.mock
          .calls[0][0] as unknown as {
          allFlatEntityOperationByMetadataName: {
            fieldPermission: { flatEntityToDelete: unknown[] };
          };
        };
        expect(
          callArg.allFlatEntityOperationByMetadataName.fieldPermission
            .flatEntityToDelete,
        ).toHaveLength(0);
      });
    });

    describe('relation cases', () => {
      it('should create two field permissions when a relation field permission is created', async () => {
        workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration.mockResolvedValue(
          { status: 'success' } as any,
        );

        const input = createUpsertInput([
          {
            canReadFieldValue: false,
            canUpdateFieldValue: false,
            fieldMetadataId: fieldRelationMock.id,
            objectMetadataId: fieldRelationMock.objectMetadataId,
          },
        ]);

        await service.upsertFieldPermissions({
          workspaceId: testWorkspaceId,
          input,
        });

        const callArg = workspaceMigrationValidateBuildAndRunService
          .validateBuildAndRunWorkspaceMigration.mock
          .calls[0][0] as unknown as {
          allFlatEntityOperationByMetadataName: {
            fieldPermission: { flatEntityToCreate: unknown[] };
          };
        };
        expect(
          callArg.allFlatEntityOperationByMetadataName.fieldPermission
            .flatEntityToCreate,
        ).toHaveLength(2);
      });
    });

    describe('validation errors', () => {
      it('should throw error when canReadFieldValue is true', async () => {
        const input = createUpsertInput([
          {
            canReadFieldValue: true,
            canUpdateFieldValue: false,
          },
        ]);

        await expect(
          service.upsertFieldPermissions({
            workspaceId: testWorkspaceId,
            input,
          }),
        ).rejects.toThrow(
          new PermissionsException(
            PermissionsExceptionMessage.ONLY_FIELD_RESTRICTION_ALLOWED,
            PermissionsExceptionCode.ONLY_FIELD_RESTRICTION_ALLOWED,
          ),
        );
      });

      it('should throw error when canUpdateFieldValue is true', async () => {
        const input = createUpsertInput([
          {
            canReadFieldValue: false,
            canUpdateFieldValue: true,
          },
        ]);

        await expect(
          service.upsertFieldPermissions({
            workspaceId: testWorkspaceId,
            input,
          }),
        ).rejects.toThrow(
          new PermissionsException(
            PermissionsExceptionMessage.ONLY_FIELD_RESTRICTION_ALLOWED,
            PermissionsExceptionCode.ONLY_FIELD_RESTRICTION_ALLOWED,
          ),
        );
      });

      it('should throw error when object metadata is not found', async () => {
        workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue(
          {
            flatRoleMaps,
            flatObjectMetadataMaps: {
              byUniversalIdentifier: {},
              universalIdentifierById: {},
              universalIdentifiersByApplicationId: {},
            },
            flatFieldMetadataMaps: {
              byUniversalIdentifier: {},
              universalIdentifierById: {},
              universalIdentifiersByApplicationId: {},
            },
          } as any,
        );

        const input = createUpsertInput([
          {
            objectMetadataId: 'non-existent-object',
            canReadFieldValue: false,
            canUpdateFieldValue: false,
          },
        ]);

        await expect(
          service.upsertFieldPermissions({
            workspaceId: testWorkspaceId,
            input,
          }),
        ).rejects.toThrow(
          new PermissionsException(
            PermissionsExceptionMessage.OBJECT_METADATA_NOT_FOUND,
            PermissionsExceptionCode.OBJECT_METADATA_NOT_FOUND,
          ),
        );
      });

      it('should throw error when trying to add field permission on system object', async () => {
        const systemObjectMetadata = {
          ...objectMetadataItemMock,
          isSystem: true,
        };

        workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue(
          {
            flatRoleMaps,
            flatObjectMetadataMaps: {
              byUniversalIdentifier: {
                [testObjectMetadataId]: {
                  ...systemObjectMetadata,
                  id: testObjectMetadataId,
                  fieldIds: [],
                  indexMetadataIds: [],
                  viewIds: [],
                  universalIdentifier: testObjectMetadataId,
                  applicationId: null,
                } as any,
              },
              universalIdentifierById: {
                [testObjectMetadataId]: testObjectMetadataId,
              },
              universalIdentifiersByApplicationId: {},
            },
            flatFieldMetadataMaps: {
              byUniversalIdentifier: {},
              universalIdentifierById: {},
              universalIdentifiersByApplicationId: {},
            },
          } as any,
        );

        const input = createUpsertInput([
          {
            canReadFieldValue: false,
            canUpdateFieldValue: false,
          },
        ]);

        await expect(
          service.upsertFieldPermissions({
            workspaceId: testWorkspaceId,
            input,
          }),
        ).rejects.toThrow(
          new PermissionsException(
            PermissionsExceptionMessage.CANNOT_ADD_FIELD_PERMISSION_ON_SYSTEM_OBJECT,
            PermissionsExceptionCode.CANNOT_ADD_FIELD_PERMISSION_ON_SYSTEM_OBJECT,
          ),
        );
      });

      it('should throw error when field metadata is not found', async () => {
        workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue(
          {
            flatRoleMaps,
            flatObjectMetadataMaps: {
              byUniversalIdentifier: {
                [testObjectMetadataId]: {
                  ...objectMetadataItemMock,
                  id: testObjectMetadataId,
                  fieldIds: [],
                  indexMetadataIds: [],
                  viewIds: [],
                  universalIdentifier: testObjectMetadataId,
                  applicationId: null,
                } as any,
              },
              universalIdentifierById: {
                [testObjectMetadataId]: testObjectMetadataId,
              },
              universalIdentifiersByApplicationId: {},
            },
            flatFieldMetadataMaps: {
              byUniversalIdentifier: {},
              universalIdentifierById: {},
              universalIdentifiersByApplicationId: {},
            },
          } as any,
        );

        const input = createUpsertInput([
          {
            fieldMetadataId: 'non-existent-field',
            canReadFieldValue: false,
            canUpdateFieldValue: false,
          },
        ]);

        await expect(
          service.upsertFieldPermissions({
            workspaceId: testWorkspaceId,
            input,
          }),
        ).rejects.toThrow(
          new PermissionsException(
            PermissionsExceptionMessage.FIELD_METADATA_NOT_FOUND,
            PermissionsExceptionCode.FIELD_METADATA_NOT_FOUND,
          ),
        );
      });

      it('should throw error when object permission is not found', async () => {
        (workspaceCacheService.getOrRecompute as jest.Mock).mockImplementation(
          (_w: string, keys: string[]) => {
            if (keys?.includes('flatFieldPermissionMaps')) {
              return Promise.resolve({
                flatFieldPermissionMaps: emptyFlatFieldPermissionMaps,
              });
            }
            if (keys?.includes('rolesPermissions')) {
              return Promise.resolve({ rolesPermissions: {} });
            }
            return Promise.resolve({});
          },
        );

        const input = createUpsertInput([
          {
            canReadFieldValue: false,
            canUpdateFieldValue: false,
          },
        ]);

        await expect(
          service.upsertFieldPermissions({
            workspaceId: testWorkspaceId,
            input,
          }),
        ).rejects.toThrow(
          new PermissionsException(
            PermissionsExceptionMessage.OBJECT_PERMISSION_NOT_FOUND,
            PermissionsExceptionCode.OBJECT_PERMISSION_NOT_FOUND,
          ),
        );
      });
    });

    describe('role validation errors', () => {
      it('should throw error when role is not editable', async () => {
        workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration.mockResolvedValue(
          {
            status: 'fail',
            report: {
              fieldPermission: [
                {
                  code: PermissionsExceptionCode.ROLE_NOT_EDITABLE,
                  message: 'Role is not editable',
                  userFriendlyMessage: 'This role cannot be modified.',
                },
              ],
            },
          } as any,
        );

        const input = createUpsertInput([
          {
            canReadFieldValue: false,
            canUpdateFieldValue: false,
          },
        ]);

        await expect(
          service.upsertFieldPermissions({
            workspaceId: testWorkspaceId,
            input,
          }),
        ).rejects.toThrow(WorkspaceMigrationBuilderException);
      });
    });
  });
});
