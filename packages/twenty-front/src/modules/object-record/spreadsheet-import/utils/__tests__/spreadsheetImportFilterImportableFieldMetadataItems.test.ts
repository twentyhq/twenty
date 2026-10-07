import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { spreadsheetImportFilterImportableFieldMetadataItems } from '@/object-record/spreadsheet-import/utils/spreadsheetImportFilterImportableFieldMetadataItems';
import { type SpreadsheetImportField } from '@/spreadsheet-import/types';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const buildFieldMetadataItem = ({
  id,
  name,
  type,
}: Pick<FieldMetadataItem, 'id' | 'name' | 'type'>): FieldMetadataItem => ({
  id,
  universalIdentifier: id,
  name,
  label: name,
  type,
  isNullable: true,
  isActive: true,
  isSystem: false,
  createdAt: '2023-01-01',
  updatedAt: '2023-01-01',
  icon: 'IconCheck',
  description: null,
});

const buildSpreadsheetImportField = ({
  key,
  fieldMetadataItemId,
}: Pick<
  SpreadsheetImportField,
  'key' | 'fieldMetadataItemId'
>): SpreadsheetImportField => ({
  Icon: null,
  key,
  label: key,
  fieldMetadataItemId,
  fieldMetadataType: FieldMetadataType.TEXT,
  fieldType: { type: 'input' },
  isNestedField: false,
});

describe('spreadsheetImportFilterImportableFieldMetadataItems', () => {
  const nameField = buildFieldMetadataItem({
    id: 'name-id',
    name: 'name',
    type: FieldMetadataType.TEXT,
  });
  const addressField = buildFieldMetadataItem({
    id: 'address-id',
    name: 'address',
    type: FieldMetadataType.ADDRESS,
  });
  const filesField = buildFieldMetadataItem({
    id: 'files-id',
    name: 'files',
    type: FieldMetadataType.FILES,
  });

  it('should keep only fields that have at least one spreadsheet import field', () => {
    const importableFieldMetadataItems =
      spreadsheetImportFilterImportableFieldMetadataItems({
        fieldMetadataItems: [nameField, addressField, filesField],
        spreadsheetImportFields: [
          buildSpreadsheetImportField({
            key: 'name',
            fieldMetadataItemId: nameField.id,
          }),
          buildSpreadsheetImportField({
            key: 'address.addressCity',
            fieldMetadataItemId: addressField.id,
          }),
          buildSpreadsheetImportField({
            key: 'address.addressStreet1',
            fieldMetadataItemId: addressField.id,
          }),
        ],
      });

    expect(importableFieldMetadataItems).toEqual([nameField, addressField]);
  });

  it('should return no fields when nothing can be imported', () => {
    expect(
      spreadsheetImportFilterImportableFieldMetadataItems({
        fieldMetadataItems: [filesField],
        spreadsheetImportFields: [],
      }),
    ).toEqual([]);
  });
});
