import { FieldMetadataType } from 'twenty-shared/types';
import { getDefaultObjectFields } from '@/cli/utilities/build/manifest/utils/get-default-object-fields';
import { generateDefaultFieldUniversalIdentifier } from '@/cli/utilities/build/manifest/utils/generate-default-field-universal-identifier';
import type { ObjectConfig } from '@/sdk/objects/object-config';

const mockObjectConfig: ObjectConfig = {
  universalIdentifier: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  nameSingular: 'testObject',
  namePlural: 'testObjects',
  labelSingular: 'Test Object',
  labelPlural: 'Test Objects',
  fields: [],
};

const expectedUniversalId = (fieldName: string) =>
  generateDefaultFieldUniversalIdentifier({
    objectConfig: mockObjectConfig,
    fieldName,
  });

describe('getDefaultObjectFields', () => {
  it('should return an array of 9 default fields', () => {
    const fields = getDefaultObjectFields(mockObjectConfig);

    expect(fields).toHaveLength(7);
  });

  it('should include an id field with UUID type', () => {
    const fields = getDefaultObjectFields(mockObjectConfig);
    const idField = fields.find((field) => field.name === 'id');

    expect(idField).toBeDefined();
    expect(idField).toEqual({
      name: 'id',
      label: 'Id',
      description: 'Id',
      icon: 'Icon123',
      isNullable: false,
      defaultValue: 'uuid',
      type: FieldMetadataType.UUID,
      universalIdentifier: expectedUniversalId('id'),
    });
  });

  it('should include a name field with TEXT type', () => {
    const fields = getDefaultObjectFields(mockObjectConfig);
    const nameField = fields.find((field) => field.name === 'name');

    expect(nameField).toBeDefined();
    expect(nameField).toEqual({
      name: 'name',
      label: 'Name',
      description: 'Name',
      icon: 'IconAbc',
      isNullable: true,
      defaultValue: null,
      type: FieldMetadataType.TEXT,
      universalIdentifier: expectedUniversalId('name'),
    });
  });

  it('should include updatedAt and deletedAt fields with DATE_TIME type', () => {
    const fields = getDefaultObjectFields(mockObjectConfig);
    const updatedAtFields = fields.filter(
      (field) => field.name === 'updatedAt',
    );
    const deletedAtField = fields.find((field) => field.name === 'deletedAt');

    expect(updatedAtFields).toHaveLength(1);
    expect(updatedAtFields[0]).toEqual({
      name: 'updatedAt',
      label: 'Last update',
      description: 'Last time the record was changed',
      icon: 'IconCalendarClock',
      isNullable: false,
      defaultValue: 'now',
      type: FieldMetadataType.DATE_TIME,
      universalIdentifier: expectedUniversalId('updatedAt'),
    });

    expect(deletedAtField).toBeDefined();
    expect(deletedAtField).toEqual({
      name: 'deletedAt',
      label: 'Deleted at',
      description: 'Deletion date',
      icon: 'IconCalendarClock',
      isNullable: true,
      defaultValue: null,
      type: FieldMetadataType.DATE_TIME,
      universalIdentifier: expectedUniversalId('deletedAt'),
    });
  });

  it('should include createdBy and updatedBy fields with ACTOR type', () => {
    const fields = getDefaultObjectFields(mockObjectConfig);
    const createdByField = fields.find((field) => field.name === 'createdBy');
    const updatedByField = fields.find((field) => field.name === 'updatedBy');

    expect(createdByField).toBeDefined();
    expect(createdByField).toEqual({
      name: 'createdBy',
      label: 'Created by',
      description: 'The creator of the record',
      icon: 'IconCreativeCommonsSa',
      isNullable: false,
      defaultValue: { name: "''", source: "'MANUAL'" },
      type: FieldMetadataType.ACTOR,
      universalIdentifier: expectedUniversalId('createdBy'),
    });

    expect(updatedByField).toBeDefined();
    expect(updatedByField).toEqual({
      name: 'updatedBy',
      label: 'Updated by',
      description: 'The workspace member who last updated the record',
      icon: 'IconUserCircle',
      isNullable: false,
      defaultValue: { name: "''", source: "'MANUAL'" },
      type: FieldMetadataType.ACTOR,
      universalIdentifier: expectedUniversalId('updatedBy'),
    });
  });

  it('should generate deterministic universalIdentifiers based on objectConfig', () => {
    const firstResult = getDefaultObjectFields(mockObjectConfig);
    const secondResult = getDefaultObjectFields(mockObjectConfig);

    firstResult.forEach((field, index) => {
      expect(field.universalIdentifier).toBe(
        secondResult[index].universalIdentifier,
      );
    });
  });

  it('should generate different universalIdentifiers for different objectConfigs', () => {
    const otherObjectConfig: ObjectConfig = {
      ...mockObjectConfig,
      universalIdentifier: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
    };

    const fieldsA = getDefaultObjectFields(mockObjectConfig);
    const fieldsB = getDefaultObjectFields(otherObjectConfig);

    fieldsA.forEach((fieldA, index) => {
      expect(fieldA.universalIdentifier).not.toBe(
        fieldsB[index].universalIdentifier,
      );
    });
  });

  it('should return fields in the expected order', () => {
    const fields = getDefaultObjectFields(mockObjectConfig);
    const fieldNames = fields.map((field) => field.name);

    expect(fieldNames).toEqual([
      'id',
      'name',
      'createdAt',
      'updatedAt',
      'deletedAt',
      'createdBy',
      'updatedBy',
    ]);
  });
});
