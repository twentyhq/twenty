import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { objectRecordChangedValues } from 'src/engine/core-modules/event-emitter/utils/object-record-changed-values';

const mockObjectMetadata: ObjectMetadataInterface = {
  id: '1',
  nameSingular: 'Object',
  namePlural: 'Objects',
  labelSingular: 'Object',
  labelPlural: 'Objects',
  description: 'Test object metadata',
  targetTableName: 'test_table',
  fromRelations: [],
  toRelations: [],
  fields: [],
  indexMetadatas: [],
  isSystem: false,
  isCustom: false,
  isActive: true,
  isRemote: false,
  isAuditLogged: true,
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
      ['name'],
      mockObjectMetadata,
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
      [],
      mockObjectMetadata,
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
      ['name', 'value'],
      mockObjectMetadata,
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
      ['name', 'config', 'status'],
      mockObjectMetadata,
    );

    expect(result).toEqual(expectedChanges);
  });
});
