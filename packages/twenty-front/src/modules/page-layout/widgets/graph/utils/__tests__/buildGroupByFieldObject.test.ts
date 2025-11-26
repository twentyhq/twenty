import { buildGroupByFieldObject } from '@/page-layout/widgets/graph/utils/buildGroupByFieldObject';
import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import { FieldMetadataType } from '~/generated-metadata/graphql';

describe('buildGroupByFieldObject', () => {
  it('should return field with Id suffix for relation fields without subFieldName', () => {
    const field = {
      name: 'company',
      type: FieldMetadataType.RELATION,
    } as any;

    const result = buildGroupByFieldObject({ field });

    expect(result).toEqual({ companyId: true });
  });

  it('should return nested object for relation field with subFieldName', () => {
    const field = {
      name: 'company',
      type: FieldMetadataType.RELATION,
    } as any;

    const result = buildGroupByFieldObject({ field, subFieldName: 'name' });

    expect(result).toEqual({ company: { name: true } });
  });

  it('should return deeply nested object for relation with composite subfield', () => {
    const field = {
      name: 'company',
      type: FieldMetadataType.RELATION,
    } as any;

    const result = buildGroupByFieldObject({
      field,
      subFieldName: 'address.addressCity',
    });

    expect(result).toEqual({
      company: { address: { addressCity: true } },
    });
  });

  it('should return date granularity for relation date field', () => {
    const field = {
      name: 'company',
      type: FieldMetadataType.RELATION,
    } as any;

    const result = buildGroupByFieldObject({
      field,
      subFieldName: 'createdAt',
      dateGranularity: ObjectRecordGroupByDateGranularity.MONTH,
    });

    expect(result).toEqual({
      company: {
        createdAt: { granularity: ObjectRecordGroupByDateGranularity.MONTH },
      },
    });
  });

  it('should return nested object for composite fields with subfield', () => {
    const field = {
      name: 'name',
      type: FieldMetadataType.FULL_NAME,
    } as any;

    const result = buildGroupByFieldObject({
      field,
      subFieldName: 'firstName',
    });

    expect(result).toEqual({
      name: {
        firstName: true,
      },
    });
  });

  it('should throw error for composite field without subfield', () => {
    const field = {
      name: 'name',
      type: FieldMetadataType.FULL_NAME,
    } as any;

    expect(() => buildGroupByFieldObject({ field })).toThrow(
      'Composite field name requires a subfield to be specified',
    );
  });

  it('should return field with default granularity for DATE field', () => {
    const field = {
      name: 'createdAt',
      type: FieldMetadataType.DATE,
    } as any;

    const result = buildGroupByFieldObject({ field });

    expect(result).toEqual({
      createdAt: {
        granularity: ObjectRecordGroupByDateGranularity.DAY,
      },
    });
  });

  it('should return field with default granularity for DATE_TIME field', () => {
    const field = {
      name: 'updatedAt',
      type: FieldMetadataType.DATE_TIME,
    } as any;

    const result = buildGroupByFieldObject({ field });

    expect(result).toEqual({
      updatedAt: {
        granularity: ObjectRecordGroupByDateGranularity.DAY,
      },
    });
  });

  it('should return field with custom granularity for date field', () => {
    const field = {
      name: 'createdAt',
      type: FieldMetadataType.DATE,
    } as any;

    const result = buildGroupByFieldObject({
      field,
      dateGranularity: ObjectRecordGroupByDateGranularity.MONTH,
    });

    expect(result).toEqual({
      createdAt: {
        granularity: ObjectRecordGroupByDateGranularity.MONTH,
      },
    });
  });

  it('should return simple field object for regular fields', () => {
    const field = {
      name: 'status',
      type: FieldMetadataType.TEXT,
    } as any;

    const result = buildGroupByFieldObject({ field });

    expect(result).toEqual({ status: true });
  });
});
