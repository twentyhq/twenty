import { type RecordGqlFields } from 'twenty-shared/types';
import { mergeRecordGqlFields } from '@/object-record/graphql/record-gql-fields/utils/mergeRecordGqlFields';

describe('mergeRecordGqlFields', () => {
  it('adds keys missing from the base selection', () => {
    expect(mergeRecordGqlFields({ id: true }, { name: true })).toEqual({
      id: true,
      name: true,
    });
  });

  it('merges nested selections key by key', () => {
    expect(
      mergeRecordGqlFields(
        { company: { id: true, name: true } },
        { company: { employees: true } },
      ),
    ).toEqual({ company: { id: true, name: true, employees: true } });
  });

  it('lets a sub-selection replace a bare true', () => {
    expect(
      mergeRecordGqlFields({ company: true }, { company: { id: true } }),
    ).toEqual({ company: { id: true } });
  });

  it('keeps an existing sub-selection when the addition is a bare true', () => {
    expect(
      mergeRecordGqlFields({ company: { id: true } }, { company: true }),
    ).toEqual({ company: { id: true } });
  });

  it('does not mutate its inputs', () => {
    const base: RecordGqlFields = { company: { id: true } };

    mergeRecordGqlFields(base, { company: { name: true } });

    expect(base).toEqual({ company: { id: true } });
  });
});
