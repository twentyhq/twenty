import { findRecordKeysChangedByMerge } from 'src/engine/api/common/common-query-runners/utils/find-record-keys-changed-by-merge.util';

describe('findRecordKeysChangedByMerge', () => {
  it('should return the keys whose merged value differs from the priority record', () => {
    const result = findRecordKeysChangedByMerge({
      mergedData: { salary: 120000, jobTitle: 'CEO' },
      priorityRecord: { id: 'priority', salary: null, jobTitle: 'CEO' },
      recordKeys: ['salary', 'jobTitle'],
    });

    expect(result).toEqual(['salary']);
  });

  it('should compare composite values deeply', () => {
    const result = findRecordKeysChangedByMerge({
      mergedData: {
        emails: {
          primaryEmail: 'a@acme.com',
          additionalEmails: ['b@acme.com'],
        },
        phones: { primaryPhoneNumber: '123', additionalPhones: null },
      },
      priorityRecord: {
        id: 'priority',
        emails: { primaryEmail: 'a@acme.com', additionalEmails: null },
        phones: { primaryPhoneNumber: '123', additionalPhones: null },
      },
      recordKeys: ['emails', 'phones'],
    });

    expect(result).toEqual(['emails']);
  });

  it('should ignore keys the merge leaves untouched', () => {
    const result = findRecordKeysChangedByMerge({
      mergedData: {},
      priorityRecord: { id: 'priority', salary: 120000 },
      recordKeys: ['salary'],
    });

    expect(result).toEqual([]);
  });
});
