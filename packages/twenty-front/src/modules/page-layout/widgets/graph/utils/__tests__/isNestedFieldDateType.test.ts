import { isNestedFieldDateType } from '@/page-layout/widgets/graph/utils/isNestedFieldDateType';
import { FieldMetadataType } from 'twenty-shared/types';

describe('isNestedFieldDateType', () => {
  const companyObject = {
    id: 'company-id',
    nameSingular: 'company',
    namePlural: 'companies',
    fields: [
      { id: 'createdAt', name: 'createdAt', type: FieldMetadataType.DATE_TIME },
      { id: 'name', name: 'name', type: FieldMetadataType.TEXT },
    ],
  } as any;

  const relationField = {
    name: 'company',
    type: FieldMetadataType.RELATION,
    relation: { targetObjectMetadata: { nameSingular: 'company' } },
  } as any;

  it('returns true for a relation subfield that is a date type', () => {
    const result = isNestedFieldDateType(relationField, 'createdAt', [
      companyObject,
    ]);

    expect(result).toBe(true);
  });

  it('returns false when the nested subfield is not a date type', () => {
    const result = isNestedFieldDateType(relationField, 'name', [
      companyObject,
    ]);

    expect(result).toBe(false);
  });

  it('returns false when subFieldName is missing', () => {
    const result = isNestedFieldDateType(relationField, undefined, [
      companyObject,
    ]);

    expect(result).toBe(false);
  });

  it('returns false for non-relation fields', () => {
    const nonRelationField = {
      name: 'status',
      type: FieldMetadataType.TEXT,
    } as any;

    const result = isNestedFieldDateType(nonRelationField, 'createdAt', [
      companyObject,
    ]);

    expect(result).toBe(false);
  });
});
