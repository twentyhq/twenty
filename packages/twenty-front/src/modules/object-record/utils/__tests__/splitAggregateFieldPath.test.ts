import {
  buildAggregateFieldPath,
  splitAggregateFieldPath,
} from '@/object-record/utils/splitAggregateFieldPath';

describe('splitAggregateFieldPath', () => {
  it('keeps an own field name as is', () => {
    expect(splitAggregateFieldPath('amount')).toEqual({
      relationFieldName: null,
      fieldName: 'amount',
    });
  });

  it('splits a path built through a relation', () => {
    expect(
      splitAggregateFieldPath(
        buildAggregateFieldPath({
          relationFieldName: 'company',
          targetFieldName: 'employees',
        }),
      ),
    ).toEqual({ relationFieldName: 'company', fieldName: 'employees' });
  });
});
