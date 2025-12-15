import { getRelationFieldOrderBy } from '@/page-layout/widgets/graph/utils/getRelationFieldOrderBy';
import {
  FieldMetadataType,
  ObjectRecordGroupByDateGranularity,
  OrderByDirection,
} from 'twenty-shared/types';

describe('getRelationFieldOrderBy', () => {
  const relationField = {
    name: 'company',
    type: FieldMetadataType.RELATION,
  } as any;

  it('returns relation id ordering when no subfield provided', () => {
    const orderBy = getRelationFieldOrderBy(
      relationField,
      null,
      OrderByDirection.AscNullsLast,
    );

    expect(orderBy).toEqual({ companyId: OrderByDirection.AscNullsLast });
  });

  it('adds granularity when nested relation field is a date field', () => {
    const orderBy = getRelationFieldOrderBy(
      relationField,
      'createdAt',
      OrderByDirection.DescNullsLast,
      undefined,
      true,
    );

    expect(orderBy).toEqual({
      company: {
        createdAt: {
          orderBy: OrderByDirection.DescNullsLast,
          granularity: ObjectRecordGroupByDateGranularity.DAY,
        },
      },
    });
  });

  it('returns nested relation ordering without granularity for non-date subfield', () => {
    const orderBy = getRelationFieldOrderBy(
      relationField,
      'name',
      OrderByDirection.AscNullsLast,
      undefined,
      false,
    );

    expect(orderBy).toEqual({
      company: {
        name: OrderByDirection.AscNullsLast,
      },
    });
  });
});
