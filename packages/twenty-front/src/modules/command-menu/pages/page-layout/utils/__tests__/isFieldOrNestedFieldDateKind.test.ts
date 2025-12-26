import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';
import { isFieldOrRelationNestedFieldDateKind } from '@/command-menu/pages/page-layout/utils/isFieldOrNestedFieldDateKind';

describe('isFieldOrNestedFieldDateKind', () => {
  it('returns false when fieldId is null', () => {
    const result = isFieldOrRelationNestedFieldDateKind({
      fieldId: null,
      subFieldName: null,
      objectMetadataItem: {} as ObjectMetadataItem,
    });

    expect(result).toBe(false);
  });

  it('returns true for a DATE type field', () => {
    const objectMetadataItem = {
      fields: [{ id: 'date-field-id', type: FieldMetadataType.DATE }],
    } as ObjectMetadataItem;

    const result = isFieldOrRelationNestedFieldDateKind({
      fieldId: 'date-field-id',
      subFieldName: null,
      objectMetadataItem,
    });

    expect(result).toBe(true);
  });

  it('returns false for a non-date type field', () => {
    const objectMetadataItem = {
      fields: [{ id: 'text-field-id', type: FieldMetadataType.TEXT }],
    } as ObjectMetadataItem;

    const result = isFieldOrRelationNestedFieldDateKind({
      fieldId: 'text-field-id',
      subFieldName: null,
      objectMetadataItem,
    });

    expect(result).toBe(false);
  });

  it('returns true for a relation subfield that is a date type', () => {
    const objectMetadataItem = {
      fields: [
        {
          id: 'relation-field-id',
          type: FieldMetadataType.RELATION,
          relation: { targetObjectMetadata: { nameSingular: 'company' } },
        },
      ],
    } as ObjectMetadataItem;

    const companyObjectMetadataItem = {
      nameSingular: 'company',
      fields: [
        {
          name: 'createdAt',
          type: FieldMetadataType.DATE,
        },
      ],
    } as ObjectMetadataItem;

    const result = isFieldOrRelationNestedFieldDateKind({
      fieldId: 'relation-field-id',
      subFieldName: 'createdAt',
      objectMetadataItem,
      objectMetadataItems: [companyObjectMetadataItem],
    });

    expect(result).toBe(true);
  });
});
