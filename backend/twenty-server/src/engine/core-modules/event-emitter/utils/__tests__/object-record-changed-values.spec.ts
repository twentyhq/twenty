import { FieldMetadataType } from 'twenty-shared/types';

import { objectRecordChangedValues } from 'src/engine/core-modules/event-emitter/utils/object-record-changed-values';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const mockObjectMetadata: FlatObjectMetadata = {
  id: '1',
  icon: 'Icon123',
  color: null,
  nameSingular: 'Object',
  namePlural: 'Objects',
  labelSingular: 'Object',
  labelPlural: 'Objects',
  targetTableName: 'test_table',
  workspaceId: '1',
  universalIdentifier: '1',
  isSystem: false,
  isCustom: false,
  isActive: true,
  isRemote: false,
  isAuditLogged: true,
  isSearchable: true,
  indexMetadataIds: [],
  objectPermissionIds: [],
  fieldPermissionIds: [],
  fieldIds: [],
  viewIds: [],
  applicationId: 'test-application-id',
  isLabelSyncedWithName: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  shortcut: null,
  description: null,
  standardOverrides: null,
  isUIReadOnly: false,
  labelIdentifierFieldMetadataId: null,
  imageIdentifierFieldMetadataId: null,
  duplicateCriteria: null,
  applicationUniversalIdentifier: 'test-application-id',
  fieldUniversalIdentifiers: [],
  objectPermissionUniversalIdentifiers: [],
  fieldPermissionUniversalIdentifiers: [],
  viewUniversalIdentifiers: [],
  indexMetadataUniversalIdentifiers: [],
  labelIdentifierFieldMetadataUniversalIdentifier: null,
  imageIdentifierFieldMetadataUniversalIdentifier: null,
};

const mockFlatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> = {
  byUniversalIdentifier: {},
  universalIdentifierById: {},
  universalIdentifiersByApplicationId: {},
};

describe('objectRecordChangedValues', () => {
  it('detects changes in scalar values correctly', () => {
    const oldRecord = {
      id: '74316f58-29b0-4a6a-b8fa-d2b506d5516m',
      name: 'Original Name',
      updatedAt: new Date().toString(),
    };
    const newRecord = {
      id: '74316f58-29b0-4a6a-b8fa-d2b506d5516m',
      name: 'Updated Name',
      updatedAt: new Date().toString(),
    };

    const result = objectRecordChangedValues(
      oldRecord,
      newRecord,
      mockObjectMetadata,
      mockFlatFieldMetadataMaps,
    );

    expect(result).toEqual({
      name: { before: 'Original Name', after: 'Updated Name' },
    });
  });

  it('ignores changes to the updatedAt field', () => {
    const oldRecord = {
      id: '74316f58-29b0-4a6a-b8fa-d2b506d5516d',
      updatedAt: new Date('2020-01-01').toDateString(),
    };
    const newRecord = {
      id: '74316f58-29b0-4a6a-b8fa-d2b506d5516d',
      updatedAt: new Date('2024-01-01').toDateString(),
    };

    const result = objectRecordChangedValues(
      oldRecord,
      newRecord,
      mockObjectMetadata,
      mockFlatFieldMetadataMaps,
    );

    expect(result).toEqual({});
  });

  it('returns an empty object when there are no changes', () => {
    const oldRecord = {
      id: '74316f58-29b0-4a6a-b8fa-d2b506d5516k',
      name: 'Name',
      value: 100,
    };
    const newRecord = {
      id: '74316f58-29b0-4a6a-b8fa-d2b506d5516k',
      name: 'Name',
      value: 100,
    };

    const result = objectRecordChangedValues(
      oldRecord,
      newRecord,
      mockObjectMetadata,
      mockFlatFieldMetadataMaps,
    );

    expect(result).toEqual({});
  });

  it('correctly handles a mix of changed, unchanged, and special case values', () => {
    const oldRecord = {
      id: '74316f58-29b0-4a6a-b8fa-d2b506d5516l',
      name: 'Original',
      status: 'active',
      updatedAt: new Date(2020, 1, 1).toDateString(),
      config: { theme: 'dark' },
    };
    const newRecord = {
      id: '74316f58-29b0-4a6a-b8fa-d2b506d5516l',
      name: 'Updated',
      status: 'active',
      updatedAt: new Date(2021, 1, 1).toDateString(),
      config: { theme: 'light' },
    };
    const expectedChanges = {
      name: { before: 'Original', after: 'Updated' },
      config: { before: { theme: 'dark' }, after: { theme: 'light' } },
    };

    const result = objectRecordChangedValues(
      oldRecord,
      newRecord,
      mockObjectMetadata,
      mockFlatFieldMetadataMaps,
    );

    expect(result).toEqual(expectedChanges);
  });

  it('ignores changes to POSITION fields', () => {
    const positionFieldId = 'position-field-id';
    const positionUniversalId = 'position-universal-id';

    const objectMetadataWithPosition: FlatObjectMetadata = {
      ...mockObjectMetadata,
      fieldIds: [positionFieldId],
    };

    const flatFieldMetadataMapsWithPosition: FlatEntityMaps<FlatFieldMetadata> =
      {
        byUniversalIdentifier: {
          [positionUniversalId]: {
            id: positionFieldId,
            name: 'position',
            type: FieldMetadataType.POSITION,
            universalIdentifier: positionUniversalId,
          } as FlatFieldMetadata,
        },
        universalIdentifierById: {
          [positionFieldId]: positionUniversalId,
        },
        universalIdentifiersByApplicationId: {},
      };

    const oldRecord = {
      id: '74316f58-29b0-4a6a-b8fa-d2b506d5516n',
      position: 1,
      name: 'Original',
    };
    const newRecord = {
      id: '74316f58-29b0-4a6a-b8fa-d2b506d5516n',
      position: 5,
      name: 'Updated',
    };

    const result = objectRecordChangedValues(
      oldRecord,
      newRecord,
      objectMetadataWithPosition,
      flatFieldMetadataMapsWithPosition,
    );

    expect(result).toEqual({
      name: { before: 'Original', after: 'Updated' },
    });
    expect(result).not.toHaveProperty('position');
  });
});
