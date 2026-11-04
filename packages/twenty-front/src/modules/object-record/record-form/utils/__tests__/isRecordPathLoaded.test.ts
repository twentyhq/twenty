import { isRecordPathLoaded } from '@/object-record/record-form/utils/isRecordPathLoaded';

describe('isRecordPathLoaded', () => {
  it('finds a top-level field', () => {
    expect(isRecordPathLoaded({ record: { stage: null }, path: 'stage' })).toBe(
      true,
    );
  });

  it('finds a nested field of a loaded relation', () => {
    expect(
      isRecordPathLoaded({
        record: { company: { employees: 12 } },
        path: 'company.employees',
      }),
    ).toBe(true);
  });

  it('misses a nested field the relation was loaded without', () => {
    expect(
      isRecordPathLoaded({
        record: { company: { id: 'company-id' } },
        path: 'company.employees',
      }),
    ).toBe(false);
  });

  it('misses a field the record does not have', () => {
    expect(isRecordPathLoaded({ record: {}, path: 'lostReason' })).toBe(false);
  });
});
