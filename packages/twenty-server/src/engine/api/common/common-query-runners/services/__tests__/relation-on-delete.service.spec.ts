import {
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';

import { RelationOnDeleteService } from 'src/engine/api/common/common-query-runners/services/relation-on-delete.service';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

describe('RelationOnDeleteService', () => {
  let service: RelationOnDeleteService;

  beforeEach(() => {
    service = new RelationOnDeleteService();
  });

  describe('nullifyForeignKeysOnSoftDelete', () => {
    it('should not run any queries when deletedRecordIds is empty', async () => {
      const mockWorkspaceDataSource = {
        getRepository: jest.fn(),
      };

      await service.nullifyForeignKeysOnSoftDelete({
        deletedRecordIds: [],
        deletedObjectMetadata: { id: 'obj-1' } as FlatObjectMetadata,
        flatFieldMetadataMaps: {
          byUniversalIdentifier: {},
          universalIdentifierById: {},
          universalIdentifiersByApplicationId: {},
        } as FlatEntityMaps<FlatFieldMetadata>,
        flatObjectMetadataMaps: {
          byUniversalIdentifier: {},
          universalIdentifierById: {},
          universalIdentifiersByApplicationId: {},
        } as FlatEntityMaps<FlatObjectMetadata>,
        // oxlint-disable-next-line @typescripttypescript/no-explicit-any
        workspaceDataSource: mockWorkspaceDataSource as any,
      });

      expect(mockWorkspaceDataSource.getRepository).not.toHaveBeenCalled();
    });

    it('should nullify FKs for SET_NULL MANY_TO_ONE relations targeting the deleted object', async () => {
      const executeMock = jest.fn().mockResolvedValue({ affected: 1 });
      const whereMock = jest.fn().mockReturnValue({ execute: executeMock });
      const setMock = jest.fn().mockReturnValue({ where: whereMock });
      const updateMock = jest.fn().mockReturnValue({ set: setMock });
      const createQueryBuilderMock = jest
        .fn()
        .mockReturnValue({ update: updateMock });
      const mockRepository = {
        createQueryBuilder: createQueryBuilderMock,
      };
      const mockWorkspaceDataSource = {
        getRepository: jest.fn().mockReturnValue(mockRepository),
      };

      const deletedObjectId = 'company-object-id';
      const referencingObjectId = 'person-object-id';

      const flatFieldMetadataMaps = {
        byUniversalIdentifier: {
          'person-company-field': {
            id: 'field-1',
            name: 'company',
            type: FieldMetadataType.RELATION,
            objectMetadataId: referencingObjectId,
            relationTargetObjectMetadataId: deletedObjectId,
            settings: {
              relationType: RelationType.MANY_TO_ONE,
              onDelete: RelationOnDeleteAction.SET_NULL,
              joinColumnName: 'companyId',
            },
          } as unknown as FlatFieldMetadata,
        },
        universalIdentifierById: {
          'field-1': 'person-company-field',
        },
        universalIdentifiersByApplicationId: {},
      } as unknown as FlatEntityMaps<FlatFieldMetadata>;

      const flatObjectMetadataMaps = {
        byUniversalIdentifier: {
          'person-object': {
            id: referencingObjectId,
            nameSingular: 'person',
          } as unknown as FlatObjectMetadata,
        },
        universalIdentifierById: {
          [referencingObjectId]: 'person-object',
        },
        universalIdentifiersByApplicationId: {},
      } as unknown as FlatEntityMaps<FlatObjectMetadata>;

      await service.nullifyForeignKeysOnSoftDelete({
        deletedRecordIds: ['company-record-1', 'company-record-2'],
        deletedObjectMetadata: {
          id: deletedObjectId,
        } as FlatObjectMetadata,
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
        // oxlint-disable-next-line @typescripttypescript/no-explicit-any
        workspaceDataSource: mockWorkspaceDataSource as any,
      });

      expect(mockWorkspaceDataSource.getRepository).toHaveBeenCalledWith(
        'person',
      );
      expect(setMock).toHaveBeenCalledWith({ companyId: null });
      expect(whereMock).toHaveBeenCalledWith(
        '"companyId" IN (:...ids)',
        { ids: ['company-record-1', 'company-record-2'] },
      );
    });

    it('should NOT nullify FKs for CASCADE relations', async () => {
      const mockWorkspaceDataSource = {
        getRepository: jest.fn(),
      };

      const deletedObjectId = 'task-object-id';

      const flatFieldMetadataMaps = {
        byUniversalIdentifier: {
          'tasktarget-task-field': {
            id: 'field-2',
            name: 'task',
            type: FieldMetadataType.RELATION,
            objectMetadataId: 'tasktarget-object-id',
            relationTargetObjectMetadataId: deletedObjectId,
            settings: {
              relationType: RelationType.MANY_TO_ONE,
              onDelete: RelationOnDeleteAction.CASCADE,
              joinColumnName: 'taskId',
            },
          } as unknown as FlatFieldMetadata,
        },
        universalIdentifierById: {
          'field-2': 'tasktarget-task-field',
        },
        universalIdentifiersByApplicationId: {},
      } as unknown as FlatEntityMaps<FlatFieldMetadata>;

      const flatObjectMetadataMaps = {
        byUniversalIdentifier: {},
        universalIdentifierById: {},
        universalIdentifiersByApplicationId: {},
      } as unknown as FlatEntityMaps<FlatObjectMetadata>;

      await service.nullifyForeignKeysOnSoftDelete({
        deletedRecordIds: ['task-record-1'],
        deletedObjectMetadata: {
          id: deletedObjectId,
        } as FlatObjectMetadata,
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
        // oxlint-disable-next-line @typescripttypescript/no-explicit-any
        workspaceDataSource: mockWorkspaceDataSource as any,
      });

      expect(mockWorkspaceDataSource.getRepository).not.toHaveBeenCalled();
    });

    it('should NOT nullify FKs for ONE_TO_MANY relations', async () => {
      const mockWorkspaceDataSource = {
        getRepository: jest.fn(),
      };

      const deletedObjectId = 'company-object-id';

      const flatFieldMetadataMaps = {
        byUniversalIdentifier: {
          'company-people-field': {
            id: 'field-3',
            name: 'people',
            type: FieldMetadataType.RELATION,
            objectMetadataId: deletedObjectId,
            relationTargetObjectMetadataId: 'person-object-id',
            settings: {
              relationType: RelationType.ONE_TO_MANY,
              onDelete: RelationOnDeleteAction.SET_NULL,
            },
          } as unknown as FlatFieldMetadata,
        },
        universalIdentifierById: {
          'field-3': 'company-people-field',
        },
        universalIdentifiersByApplicationId: {},
      } as unknown as FlatEntityMaps<FlatFieldMetadata>;

      const flatObjectMetadataMaps = {
        byUniversalIdentifier: {},
        universalIdentifierById: {},
        universalIdentifiersByApplicationId: {},
      } as unknown as FlatEntityMaps<FlatObjectMetadata>;

      await service.nullifyForeignKeysOnSoftDelete({
        deletedRecordIds: ['company-record-1'],
        deletedObjectMetadata: {
          id: deletedObjectId,
        } as FlatObjectMetadata,
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
        // oxlint-disable-next-line @typescripttypescript/no-explicit-any
        workspaceDataSource: mockWorkspaceDataSource as any,
      });

      expect(mockWorkspaceDataSource.getRepository).not.toHaveBeenCalled();
    });
  });
});
