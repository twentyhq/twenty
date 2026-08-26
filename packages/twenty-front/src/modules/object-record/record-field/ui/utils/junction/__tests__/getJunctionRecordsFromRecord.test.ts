import { getJunctionRecordsFromRecord } from '@/object-record/record-field/ui/utils/junction/getJunctionRecordsFromRecord';

describe('getJunctionRecordsFromRecord', () => {
  it('reads junction records from a runtime-named field', () => {
    expect(
      getJunctionRecordsFromRecord({
        record: {
          customTargets: [{ id: 'target-1' }, null, { invalid: true }],
        },
        junctionFieldName: 'customTargets',
      }),
    ).toEqual([{ id: 'target-1' }]);
  });

  it('returns an empty array for missing and non-array fields', () => {
    expect(
      getJunctionRecordsFromRecord({
        record: undefined,
        junctionFieldName: 'targets',
      }),
    ).toEqual([]);
    expect(
      getJunctionRecordsFromRecord({
        record: { targets: null },
        junctionFieldName: 'targets',
      }),
    ).toEqual([]);
  });
});
