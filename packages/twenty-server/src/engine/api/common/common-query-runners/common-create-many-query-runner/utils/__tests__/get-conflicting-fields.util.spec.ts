import { FieldMetadataType } from 'twenty-shared/types';

import { objectMetadataMapItemMock } from 'src/engine/api/__mocks__/object-metadata-item.mock';
import { getConflictingFields } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/utils/get-conflicting-fields.util';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { getMockFieldMetadataEntity } from 'src/utils/__test__/get-field-metadata-entity.mock';

describe('getConflictingFields', () => {
  const workspaceId = 'workspaceId';
  const objectMetadataId = 'objectMetadataId';

  const idField = getMockFieldMetadataEntity({
    workspaceId,
    objectMetadataId,
    id: 'id-field-id',
    name: 'id',
    type: FieldMetadataType.UUID,
    isUnique: true,
  });

  const uniqueTextField = getMockFieldMetadataEntity({
    workspaceId,
    objectMetadataId,
    id: 'unique-text-id',
    name: 'uniqueText',
    type: FieldMetadataType.TEXT,
    isUnique: true,
  });

  const emailsUniqueField = getMockFieldMetadataEntity({
    workspaceId,
    objectMetadataId,
    id: 'emails-unique-id',
    name: 'emailsField',
    type: FieldMetadataType.EMAILS,
    isUnique: true,
  });

  const phonesNotUniqueField = getMockFieldMetadataEntity({
    workspaceId,
    objectMetadataId,
    id: 'phones-not-unique-id',
    name: 'phonesField',
    type: FieldMetadataType.PHONES,
    isUnique: false,
  });

  const addressUniqueFieldNoIncludedProp = getMockFieldMetadataEntity({
    workspaceId,
    objectMetadataId,
    id: 'address-unique-id',
    name: 'addressField',
    type: FieldMetadataType.ADDRESS,
    isUnique: true,
  });

  const buildObjectMetadataWithFields = (
    fields: (typeof idField)[],
  ): ObjectMetadataItemWithFieldMaps => {
    const fieldsById = fields.reduce<Record<string, typeof idField>>(
      (acc, field) => {
        acc[field.id] = field;

        return acc;
      },
      {},
    );

    return {
      ...objectMetadataMapItemMock,
      fieldsById,
      fieldIdByName: Object.fromEntries(
        Object.values(fieldsById).map((f) => [f.name, f.id]),
      ),
    } as ObjectMetadataItemWithFieldMaps;
  };

  it('returns id and unique non-composite fields as conflicts', () => {
    const objectMetadata = buildObjectMetadataWithFields([
      idField,
      uniqueTextField,
    ]);

    const result = getConflictingFields(objectMetadata);

    expect(result).toEqual(
      expect.arrayContaining([
        { baseField: 'id', fullPath: 'id', column: 'id' },
        {
          baseField: 'uniqueText',
          fullPath: 'uniqueText',
          column: 'uniqueText',
        },
      ]),
    );
  });

  it('returns composite field with included unique property using full path and computed column', () => {
    const objectMetadata = buildObjectMetadataWithFields([
      idField,
      emailsUniqueField,
    ]);

    const result = getConflictingFields(objectMetadata);

    expect(result).toEqual(
      expect.arrayContaining([
        { baseField: 'id', fullPath: 'id', column: 'id' },
        {
          baseField: 'emailsField',
          fullPath: 'emailsField.primaryEmail',
          column: 'emailsFieldPrimaryEmail',
        },
      ]),
    );
  });

  it('does not include composite fields without included unique property', () => {
    const objectMetadata = buildObjectMetadataWithFields([
      idField,
      addressUniqueFieldNoIncludedProp,
    ]);

    const result = getConflictingFields(objectMetadata);

    expect(result).toEqual([{ baseField: 'id', fullPath: 'id', column: 'id' }]);
  });

  it('ignores non-unique fields', () => {
    const objectMetadata = buildObjectMetadataWithFields([
      idField,
      phonesNotUniqueField,
    ]);

    const result = getConflictingFields(objectMetadata);

    expect(result).toEqual([{ baseField: 'id', fullPath: 'id', column: 'id' }]);
  });
});
