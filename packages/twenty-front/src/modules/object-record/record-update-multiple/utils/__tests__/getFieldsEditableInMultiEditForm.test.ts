import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getFieldsEditableInMultiEditForm } from '@/object-record/record-update-multiple/utils/getFieldsEditableInMultiEditForm';
import { FieldMetadataType } from 'twenty-shared/types';

const createMockFieldMetadataItem = (
  overrides: Partial<FieldMetadataItem> = {},
): FieldMetadataItem =>
  ({
    id: 'test-field-id',
    name: 'testField',
    label: 'Test Field',
    type: FieldMetadataType.TEXT,
    isActive: true,
    isSystem: false,
    isUIEditable: true,
    isUnique: false,
    isNullable: true,
    ...overrides,
  }) as FieldMetadataItem;

const createMockObjectMetadataItem = ({
  fields,
  readableFieldIds,
  updatableFieldIds,
}: {
  fields: FieldMetadataItem[];
  readableFieldIds: string[];
  updatableFieldIds: string[];
}) =>
  ({
    fields,
    readableFields: fields.filter((field) =>
      readableFieldIds.includes(field.id),
    ),
    updatableFields: fields.filter((field) =>
      updatableFieldIds.includes(field.id),
    ),
  }) as any;

describe('getFieldsEditableInMultiEditForm', () => {
  it('should only return fields the member can both read and update', () => {
    const readableField = createMockFieldMetadataItem({
      id: 'field-readable',
      name: 'readableField',
    });
    const unreadableButUpdatableField = createMockFieldMetadataItem({
      id: 'field-unreadable',
      name: 'unreadableButUpdatableField',
    });
    const updatableButUnreadableField = createMockFieldMetadataItem({
      id: 'field-not-updatable',
      name: 'updatableButUnreadableField',
    });

    const objectMetadataItem = createMockObjectMetadataItem({
      fields: [
        readableField,
        unreadableButUpdatableField,
        updatableButUnreadableField,
      ],
      readableFieldIds: ['field-readable', 'field-not-updatable'],
      updatableFieldIds: ['field-readable', 'field-unreadable'],
    });

    const result = getFieldsEditableInMultiEditForm(objectMetadataItem);

    expect(result).toEqual([readableField]);
  });

  it('should exclude unique fields', () => {
    const uniqueField = createMockFieldMetadataItem({
      id: 'field-unique',
      name: 'uniqueField',
      isUnique: true,
    });
    const regularField = createMockFieldMetadataItem({
      id: 'field-regular',
      name: 'regularField',
    });

    const objectMetadataItem = createMockObjectMetadataItem({
      fields: [uniqueField, regularField],
      readableFieldIds: ['field-unique', 'field-regular'],
      updatableFieldIds: ['field-unique', 'field-regular'],
    });

    const result = getFieldsEditableInMultiEditForm(objectMetadataItem);

    expect(result).toEqual([regularField]);
  });

  it('should return all displayed fields when no field is restricted', () => {
    const amountField = createMockFieldMetadataItem({
      id: 'field-amount',
      name: 'amount',
    });
    const nameField = createMockFieldMetadataItem({
      id: 'field-name',
      name: 'name',
    });

    const objectMetadataItem = createMockObjectMetadataItem({
      fields: [amountField, nameField],
      readableFieldIds: ['field-amount', 'field-name'],
      updatableFieldIds: ['field-amount', 'field-name'],
    });

    const result = getFieldsEditableInMultiEditForm(objectMetadataItem);

    expect(result).toEqual([amountField, nameField]);
  });
});
