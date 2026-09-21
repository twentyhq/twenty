import {
  FieldMetadataType,
  IndexType,
  RelationType,
} from 'twenty-shared/types';

import { rebindFlatIndexToWorkspaceColumns } from 'src/database/commands/upgrade-version-command/2-38/utils/rebind-flat-index-to-workspace-columns.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatIndexMetadataMock } from 'src/engine/metadata-modules/flat-index-metadata/__mocks__/get-flat-index-metadata.mock';
import { TASK_TARGET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/task-target-flat-object.mock';

const CREATED_AT = '2026-09-04T00:00:00.000Z';
const INDEX_ID = 'index-id';
const INDEX_UNIVERSAL_IDENTIFIER = '4adf4d5a-ad69-4c5c-bc62-2807816b3aa8';

const taskField = getFlatFieldMetadataMock({
  id: 'legacy-task-field-id',
  universalIdentifier: 'legacy-task-field-universal-identifier',
  objectMetadataId: TASK_TARGET_FLAT_OBJECT_MOCK.id,
  type: FieldMetadataType.RELATION,
  name: 'task',
  settings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'taskId',
  },
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'taskId',
  },
});
const personField = getFlatFieldMetadataMock({
  id: 'legacy-person-field-id',
  universalIdentifier: 'legacy-person-field-universal-identifier',
  objectMetadataId: TASK_TARGET_FLAT_OBJECT_MOCK.id,
  type: FieldMetadataType.RELATION,
  name: 'person',
  settings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'personId',
  },
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'personId',
  },
});
const flatIndexMetadata = getFlatIndexMetadataMock({
  id: INDEX_ID,
  universalIdentifier: INDEX_UNIVERSAL_IDENTIFIER,
  objectMetadataId: 'standard-task-target-object-id',
  objectMetadataUniversalIdentifier:
    TASK_TARGET_FLAT_OBJECT_MOCK.universalIdentifier,
  applicationUniversalIdentifier:
    TASK_TARGET_FLAT_OBJECT_MOCK.applicationUniversalIdentifier,
  indexType: IndexType.BTREE,
  indexWhereClause: '"deletedAt" IS NULL',
  isUnique: true,
  name: 'standard-index-name',
  flatIndexFieldMetadatas: [taskField, personField].map(
    (fieldMetadata, order) => ({
      id: `index-field-${order}`,
      workspaceId: TASK_TARGET_FLAT_OBJECT_MOCK.workspaceId,
      indexMetadataId: INDEX_ID,
      fieldMetadataId: `standard-field-${order}`,
      order,
      subFieldName: null,
      createdAt: CREATED_AT,
      updatedAt: CREATED_AT,
    }),
  ),
  universalFlatIndexFieldMetadatas: [taskField, personField].map(
    (_, order) => ({
      indexMetadataUniversalIdentifier: INDEX_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier: `standard-field-${order}`,
      order,
      subFieldName: null,
      createdAt: CREATED_AT,
      updatedAt: CREATED_AT,
    }),
  ),
});

describe('rebindFlatIndexToWorkspaceColumns', () => {
  it('binds index fields and its name to legacy workspace relations', () => {
    const result = rebindFlatIndexToWorkspaceColumns({
      flatIndexMetadata,
      flatObjectMetadata: TASK_TARGET_FLAT_OBJECT_MOCK,
      objectFlatFieldMetadatas: [taskField, personField],
      columnNames: ['taskId', 'personId'],
    });

    expect(result.objectMetadataId).toBe(TASK_TARGET_FLAT_OBJECT_MOCK.id);
    expect(
      result.flatIndexFieldMetadatas.map(
        ({ fieldMetadataId }) => fieldMetadataId,
      ),
    ).toEqual([taskField.id, personField.id]);
    expect(
      result.universalFlatIndexFieldMetadatas.map(
        ({ fieldMetadataUniversalIdentifier }) =>
          fieldMetadataUniversalIdentifier,
      ),
    ).toEqual([taskField.universalIdentifier, personField.universalIdentifier]);
    expect(result.name).not.toBe(flatIndexMetadata.name);
  });

  it('throws when a workspace relation column cannot be resolved', () => {
    expect(() =>
      rebindFlatIndexToWorkspaceColumns({
        flatIndexMetadata,
        flatObjectMetadata: TASK_TARGET_FLAT_OBJECT_MOCK,
        objectFlatFieldMetadatas: [taskField],
        columnNames: ['taskId', 'personId'],
      }),
    ).toThrow('Could not find relation field for column personId');
  });
});
