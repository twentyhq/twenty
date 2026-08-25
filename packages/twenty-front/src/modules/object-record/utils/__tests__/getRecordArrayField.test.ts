import { getRecordArrayField } from '@/object-record/utils/getRecordArrayField';

describe('getRecordArrayField', () => {
  it('returns the array stored under a runtime field name', () => {
    expect(
      getRecordArrayField<{ id: string }>(
        { taskTargets: [{ id: 'target-1' }] },
        'taskTargets',
      ),
    ).toEqual([{ id: 'target-1' }]);
  });

  it('returns an empty array when the field is missing or not an array', () => {
    expect(getRecordArrayField(undefined, 'taskTargets')).toEqual([]);
    expect(getRecordArrayField({ taskTargets: null }, 'taskTargets')).toEqual(
      [],
    );
    expect(getRecordArrayField({}, 'taskTargets')).toEqual([]);
  });
});
