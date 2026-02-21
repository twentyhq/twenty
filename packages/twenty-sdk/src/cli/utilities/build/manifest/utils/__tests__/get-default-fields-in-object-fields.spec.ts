import { FieldMetadataType } from 'twenty-shared/types';
import { getDefaultFieldsInObjectFields } from '@/cli/utilities/build/manifest/utils/get-default-fields-in-object-fields';
import { getDefaultObjectFields } from '@/cli/utilities/build/manifest/utils/get-default-object-fields';
import type { ObjectConfig } from '@/sdk/objects/object-config';
import { getDefaultRelationObjectFields } from '@/cli/utilities/build/manifest/utils/get-default-relation-object-fields';
import { type ObjectFieldManifest } from 'twenty-shared/application';

const baseObjectConfig: ObjectConfig = {
  universalIdentifier: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  nameSingular: 'testObject',
  namePlural: 'testObjects',
  labelSingular: 'Test Object',
  labelPlural: 'Test Objects',
  fields: [],
};

describe('getDefaultFieldsInObjectFields', () => {
  it('should return all default fields when objectConfig has no fields', () => {
    const { objectFields, fields } =
      getDefaultFieldsInObjectFields(baseObjectConfig);
    const defaultFields = getDefaultObjectFields(baseObjectConfig);
    const {
      objectFields: defaultRelationObjectFields,
      fields: expectedReverseFields,
    } = getDefaultRelationObjectFields(baseObjectConfig);

    expect(objectFields).toEqual([
      ...defaultFields,
      ...defaultRelationObjectFields,
    ]);
    expect(fields).toEqual(expectedReverseFields);
  });

  it('should preserve custom fields and append missing default fields', () => {
    const customField: ObjectFieldManifest = {
      universalIdentifier: '11111111-1111-1111-1111-111111111111',
      name: 'customField',
      label: 'Custom Field',
      type: FieldMetadataType.TEXT,
    };

    const objectConfig: ObjectConfig = {
      ...baseObjectConfig,
      fields: [customField],
    };

    const { objectFields } = getDefaultFieldsInObjectFields(objectConfig);
    const defaultFields = getDefaultObjectFields(objectConfig);
    const { objectFields: defaultRelationObjectFields } =
      getDefaultRelationObjectFields(objectConfig);

    expect(objectFields[0]).toEqual(customField);
    expect(objectFields).toHaveLength(
      1 + defaultFields.length + defaultRelationObjectFields.length,
    );
  });

  it('should not inject a default field when a field with the same name exists', () => {
    const customIdField: ObjectFieldManifest = {
      universalIdentifier: '22222222-2222-2222-2222-222222222222',
      name: 'id',
      label: 'Custom Id',
      type: FieldMetadataType.TEXT,
    };

    const objectConfig: ObjectConfig = {
      ...baseObjectConfig,
      fields: [customIdField],
    };

    const { objectFields } = getDefaultFieldsInObjectFields(objectConfig);

    const idFields = objectFields.filter((f) => f.name === 'id');

    expect(idFields).toHaveLength(1);
    expect(idFields[0]).toEqual(customIdField);
  });

  it('should skip multiple default fields when overridden by custom fields', () => {
    const customFields: ObjectFieldManifest[] = [
      {
        universalIdentifier: '33333333-3333-3333-3333-333333333333',
        name: 'id',
        label: 'Custom Id',
        type: FieldMetadataType.TEXT,
      },
      {
        universalIdentifier: '44444444-4444-4444-4444-444444444444',
        name: 'name',
        label: 'Custom Name',
        type: FieldMetadataType.TEXT,
      },
      {
        universalIdentifier: '55555555-5555-5555-5555-555555555555',
        name: 'position',
        label: 'Custom Position',
        type: FieldMetadataType.NUMBER,
      },
    ];

    const objectConfig: ObjectConfig = {
      ...baseObjectConfig,
      fields: customFields,
    };

    const { objectFields } = getDefaultFieldsInObjectFields(objectConfig);
    const defaultFields = getDefaultObjectFields(objectConfig);
    const { objectFields: defaultRelationObjectFields } =
      getDefaultRelationObjectFields(objectConfig);
    const overriddenCount = defaultFields.filter((df) =>
      customFields.some((cf) => cf.name === df.name),
    ).length;

    expect(objectFields).toHaveLength(
      customFields.length +
        defaultFields.length +
        defaultRelationObjectFields.length -
        overriddenCount,
    );

    expect(objectFields.filter((f) => f.name === 'id')).toHaveLength(1);
    expect(objectFields.filter((f) => f.name === 'name')).toHaveLength(1);
    expect(objectFields.filter((f) => f.name === 'position')).toHaveLength(1);
  });

  it('should place custom fields before default fields in the result', () => {
    const customField: ObjectFieldManifest = {
      universalIdentifier: '66666666-6666-6666-6666-666666666666',
      name: 'customField',
      label: 'Custom Field',
      type: FieldMetadataType.TEXT,
    };

    const objectConfig: ObjectConfig = {
      ...baseObjectConfig,
      fields: [customField],
    };

    const { objectFields } = getDefaultFieldsInObjectFields(objectConfig);

    expect(objectFields[0]).toEqual(customField);
  });

  it('should not mutate the original objectConfig fields array', () => {
    const customField: ObjectFieldManifest = {
      universalIdentifier: '77777777-7777-7777-7777-777777777777',
      name: 'customField',
      label: 'Custom Field',
      type: FieldMetadataType.TEXT,
    };

    const objectConfig: ObjectConfig = {
      ...baseObjectConfig,
      fields: [customField],
    };

    const originalLength = objectConfig.fields.length;

    getDefaultFieldsInObjectFields(objectConfig);

    expect(objectConfig.fields).toHaveLength(originalLength);
  });

  it('should return reverse relation fields for each default relation', () => {
    const { fields } = getDefaultFieldsInObjectFields(baseObjectConfig);

    expect(fields).toHaveLength(5);

    const fieldNames = fields.map((f) => f.name);

    expect(fieldNames).toContain('targetTestObject');
  });
});
