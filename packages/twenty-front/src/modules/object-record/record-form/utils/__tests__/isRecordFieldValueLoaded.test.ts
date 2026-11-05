import { isRecordFieldValueLoaded } from '@/object-record/record-form/utils/isRecordFieldValueLoaded';

describe('isRecordFieldValueLoaded', () => {
  it('finds a top-level field', () => {
    expect(
      isRecordFieldValueLoaded({ record: { stage: null }, fieldPath: 'stage' }),
    ).toBe(true);
  });

  it('finds a nested field of a loaded relation', () => {
    expect(
      isRecordFieldValueLoaded({
        record: { company: { employees: 12 } },
        fieldPath: 'company.employees',
      }),
    ).toBe(true);
  });

  it('misses a nested field the relation was loaded without', () => {
    expect(
      isRecordFieldValueLoaded({
        record: { company: { id: 'company-id' } },
        fieldPath: 'company.employees',
      }),
    ).toBe(false);
  });

  it('misses a field the record does not have', () => {
    expect(
      isRecordFieldValueLoaded({ record: {}, fieldPath: 'lostReason' }),
    ).toBe(false);
  });

  it('misses a field whose value is undefined', () => {
    expect(
      isRecordFieldValueLoaded({
        record: { lostReason: undefined },
        fieldPath: 'lostReason',
      }),
    ).toBe(false);
  });
});
