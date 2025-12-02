import { isRelationNestedFieldDateKind } from '@/page-layout/widgets/graph/utils/isRelationNestedFieldDateKind';
import { FieldMetadataType } from 'twenty-shared/types';

describe('isRelationNestedFieldDateKind', () => {
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
    const result = isRelationNestedFieldDateKind({
      relationField: relationField,
      relationNestedFieldName: 'createdAt',
      objectMetadataItems: [companyObject],
    });
    expect(result).toBe(true);
  });

  it('returns false when the nested subfield is not a date type', () => {
    const result = isRelationNestedFieldDateKind({
      relationField: relationField,
      relationNestedFieldName: 'name',
      objectMetadataItems: [companyObject],
    });

    expect(result).toBe(false);
  });

  it('returns false when subFieldName is missing', () => {
    const result = isRelationNestedFieldDateKind({
      relationField: relationField,
      relationNestedFieldName: undefined as string | undefined,
      objectMetadataItems: [companyObject],
    });

    expect(result).toBe(false);
  });

  it('returns false for non-relation fields', () => {
    const nonRelationField = {
      name: 'status',
      type: FieldMetadataType.TEXT,
    } as any;

    const result = isRelationNestedFieldDateKind({
      relationField: nonRelationField,
      relationNestedFieldName: 'createdAt',
      objectMetadataItems: [companyObject],
    });

    expect(result).toBe(false);
  });
});
