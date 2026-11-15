import { addLookupTargetsToRecordGqlFields } from '@/object-record/record-column-lookup/utils/addLookupTargetsToRecordGqlFields';
import { type RecordGqlFields } from 'twenty-shared/types';

describe('addLookupTargetsToRecordGqlFields', () => {
  it('adds the looked-up field inside the relation selection', () => {
    expect(
      addLookupTargetsToRecordGqlFields({
        recordGqlFields: { company: { id: true, name: true }, companyId: true },
        lookupColumns: [
          { relationFieldName: 'company', lookupTargetFieldName: 'employees' },
        ],
      }),
    ).toEqual({
      company: { id: true, name: true, employees: true },
      companyId: true,
    });
  });

  it('leaves the selection unchanged when the relation is not selected', () => {
    const recordGqlFields: RecordGqlFields = { id: true };

    expect(
      addLookupTargetsToRecordGqlFields({
        recordGqlFields,
        lookupColumns: [
          { relationFieldName: 'company', lookupTargetFieldName: 'employees' },
        ],
      }),
    ).toEqual(recordGqlFields);
  });
});
