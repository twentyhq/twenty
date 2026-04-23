import { type PartialObjectRecordWithId } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/types/partial-object-record-with-id.type';
import { getMatchingRecordId } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/utils/get-matching-record-id.util';
import { CommonQueryRunnerExceptionCode } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

describe('getMatchingRecordId', () => {
  const existingRecords: PartialObjectRecordWithId[] = [
    {
      id: 'recordId1',
      uniqueText: 'alpha',
      emailsField: { primaryEmail: 'alpha@example.com' },
    },
    {
      id: 'recordId2',
      uniqueText: 'beta',
      emailsField: { primaryEmail: 'beta@example.com' },
    },
  ];

  it('returns the matching record id when exactly one field matches one existing record', () => {
    const record = {
      emailsField: { primaryEmail: 'alpha@example.com' },
    };

    const conflictingFields = [
      {
        baseField: 'emailsField',
        fullPath: 'emailsField.primaryEmail',
        column: 'emailsFieldPrimaryEmail',
      },
    ];

    const id = getMatchingRecordId(record, conflictingFields, existingRecords);

    expect(id).toBe('recordId1');
  });

  it('returns undefined when no existing record matches any conflicting field', () => {
    const record = {
      emailsField: { primaryEmail: 'nobody@example.com' },
    };

    const conflictingFields = [
      {
        baseField: 'emailsField',
        fullPath: 'emailsField.primaryEmail',
        column: 'emailsFieldPrimaryEmail',
      },
    ];

    const id = getMatchingRecordId(record, conflictingFields, existingRecords);

    expect(id).toBeUndefined();
  });

  it('returns the matching id if multiple conflicting fields point to the same existing record', () => {
    const record = {
      id: 'recordId1',
      uniqueText: 'alpha',
    };

    const conflictingFields = [
      { baseField: 'id', fullPath: 'id', column: 'id' },
      { baseField: 'uniqueText', fullPath: 'uniqueText', column: 'uniqueText' },
    ];

    const id = getMatchingRecordId(record, conflictingFields, existingRecords);

    expect(id).toBe('recordId1');
  });

  it('throws when conflicting fields match different existing records', () => {
    const record = {
      uniqueText: 'alpha',
      emailsField: { primaryEmail: 'beta@example.com' },
    };

    const conflictingFields = [
      { baseField: 'uniqueText', fullPath: 'uniqueText', column: 'uniqueText' },
      {
        baseField: 'emailsField',
        fullPath: 'emailsField.primaryEmail',
        column: 'emailsFieldPrimaryEmail',
      },
    ];

    expect(() =>
      getMatchingRecordId(record, conflictingFields, existingRecords),
    ).toThrow();

    try {
      getMatchingRecordId(record, conflictingFields, existingRecords);
    } catch (error) {
      expect(error.code).toBe(
        CommonQueryRunnerExceptionCode.UPSERT_MULTIPLE_MATCHING_RECORDS_CONFLICT,
      );
    }
  });
});
