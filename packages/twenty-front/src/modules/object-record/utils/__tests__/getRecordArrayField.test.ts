import { getRecordArrayField } from '@/object-record/utils/getRecordArrayField';

describe('getRecordArrayField', () => {
  it('reads records from a runtime-named array field', () => {
    expect(
      getRecordArrayField({
        record: {
          customTargets: [{ id: 'target-1' }, null, { invalid: true }],
        },
        fieldName: 'customTargets',
      }),
    ).toEqual([{ id: 'target-1' }]);
  });

  it('returns an empty array for missing and non-array fields', () => {
    expect(
      getRecordArrayField({ record: undefined, fieldName: 'targets' }),
    ).toEqual([]);
    expect(
      getRecordArrayField({ record: { targets: null }, fieldName: 'targets' }),
    ).toEqual([]);
  });
});
