import { FieldMetadataType } from 'twenty-shared/types';
import { injectDefaultFieldsInObjectFields } from '@/cli/utilities/build/manifest/utils/inject-default-fields-in-object-fields';
import { getDefaultObjectFields } from '@/cli/utilities/build/manifest/utils/get-default-object-fields';
import type { ObjectConfig } from '@/sdk/objects/object-config';

const baseObjectConfig: ObjectConfig = {
  universalIdentifier: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  nameSingular: 'testObject',
  namePlural: 'testObjects',
  labelSingular: 'Test Object',
  labelPlural: 'Test Objects',
  fields: [],
};

describe('injectDefaultFieldsInObjectFields', () => {
  it('should return all default fields when objectConfig has no fields', () => {
    const result = injectDefaultFieldsInObjectFields(baseObjectConfig);
    const defaultFields = getDefaultObjectFields(baseObjectConfig);

    expect(result).toEqual(defaultFields);
  });

  it('should preserve custom fields and append missing default fields', () => {
    const customField = {
      universalIdentifier: '11111111-1111-1111-1111-111111111111',
      name: 'customField',
      label: 'Custom Field',
      type: FieldMetadataType.TEXT,
    };

    const objectConfig: ObjectConfig = {
      ...baseObjectConfig,
      fields: [customField],
    };

    const result = injectDefaultFieldsInObjectFields(objectConfig);
    const defaultFields = getDefaultObjectFields(objectConfig);

    expect(result[0]).toEqual(customField);
    expect(result).toHaveLength(1 + defaultFields.length);
  });

  it('should not inject a default field when a field with the same name exists', () => {
    const customIdField = {
      universalIdentifier: '22222222-2222-2222-2222-222222222222',
      name: 'id',
      label: 'Custom Id',
      type: FieldMetadataType.TEXT,
    };

    const objectConfig: ObjectConfig = {
      ...baseObjectConfig,
      fields: [customIdField],
    };

    const result = injectDefaultFieldsInObjectFields(objectConfig);

    const idFields = result.filter((f) => f.name === 'id');

    expect(idFields).toHaveLength(1);
    expect(idFields[0]).toEqual(customIdField);
  });

  it('should skip multiple default fields when overridden by custom fields', () => {
    const customFields = [
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

    const result = injectDefaultFieldsInObjectFields(objectConfig);
    const defaultFields = getDefaultObjectFields(objectConfig);
    const overriddenCount = defaultFields.filter((df) =>
      customFields.some((cf) => cf.name === df.name),
    ).length;

    expect(result).toHaveLength(
      customFields.length + defaultFields.length - overriddenCount,
    );

    expect(result.filter((f) => f.name === 'id')).toHaveLength(1);
    expect(result.filter((f) => f.name === 'name')).toHaveLength(1);
    expect(result.filter((f) => f.name === 'position')).toHaveLength(1);
  });

  it('should place custom fields before default fields in the result', () => {
    const customField = {
      universalIdentifier: '66666666-6666-6666-6666-666666666666',
      name: 'customField',
      label: 'Custom Field',
      type: FieldMetadataType.TEXT,
    };

    const objectConfig: ObjectConfig = {
      ...baseObjectConfig,
      fields: [customField],
    };

    const result = injectDefaultFieldsInObjectFields(objectConfig);

    expect(result[0]).toEqual(customField);
  });

  it('should not mutate the original objectConfig fields array', () => {
    const customField = {
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

    injectDefaultFieldsInObjectFields(objectConfig);

    expect(objectConfig.fields).toHaveLength(originalLength);
  });
});
