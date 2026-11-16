import { type ConflictingFieldGroup } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/types/conflicting-field-group.type';
import { type PartialObjectRecordWithId } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/types/partial-object-record-with-id.type';
import { getMatchingRecordId } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/utils/get-matching-record-id.util';
import { CommonQueryRunnerExceptionCode } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

describe('getMatchingRecordId', () => {
  const existingRecords: PartialObjectRecordWithId[] = [
    {
      id: 'recordId1',
      uniqueText: 'alpha',
      emailsField: { primaryEmail: 'alpha@example.com' },
      phonesField: {
        primaryPhoneNumber: '123456789',
        primaryPhoneCallingCode: '+1',
      },
    },
    {
      id: 'recordId2',
      uniqueText: 'beta',
      emailsField: { primaryEmail: 'beta@example.com' },
      phonesField: {
        primaryPhoneNumber: '123456789',
        primaryPhoneCallingCode: '+32',
      },
    },
  ];

  it('returns the matching record id when exactly one field matches one existing record', () => {
    const record = {
      emailsField: { primaryEmail: 'alpha@example.com' },
    };

    const conflictingFieldGroups: ConflictingFieldGroup[] = [
      {
        baseFields: ['emailsField'],
        conflictingProperties: [
          {
            fullPath: 'emailsField.primaryEmail',
            column: 'emailsFieldPrimaryEmail',
          },
        ],
      },
    ];

    const id = getMatchingRecordId(
      record,
      conflictingFieldGroups,
      existingRecords,
    );

    expect(id).toBe('recordId1');
  });

  it('returns the matching record id when every composite unique field matches the same existing record', () => {
    const record = {
      phonesField: {
        primaryPhoneNumber: '123456789',
        primaryPhoneCallingCode: '+32',
      },
    };

    const conflictingFieldGroups: ConflictingFieldGroup[] = [
      {
        baseFields: ['phonesField'],
        conflictingProperties: [
          {
            fullPath: 'phonesField.primaryPhoneNumber',
            column: 'phonesFieldPrimaryPhoneNumber',
          },
          {
            fullPath: 'phonesField.primaryPhoneCallingCode',
            column: 'phonesFieldPrimaryPhoneCallingCode',
          },
        ],
      },
    ];

    const id = getMatchingRecordId(
      record,
      conflictingFieldGroups,
      existingRecords,
    );

    expect(id).toBe('recordId2');
  });

  it('returns undefined when only part of a composite unique field matches', () => {
    const record = {
      phonesField: {
        primaryPhoneNumber: '123456789',
        primaryPhoneCallingCode: '+33',
      },
    };

    const conflictingFieldGroups: ConflictingFieldGroup[] = [
      {
        baseFields: ['phonesField'],
        conflictingProperties: [
          {
            fullPath: 'phonesField.primaryPhoneNumber',
            column: 'phonesFieldPrimaryPhoneNumber',
          },
          {
            fullPath: 'phonesField.primaryPhoneCallingCode',
            column: 'phonesFieldPrimaryPhoneCallingCode',
          },
        ],
      },
    ];

    const id = getMatchingRecordId(
      record,
      conflictingFieldGroups,
      existingRecords,
    );

    expect(id).toBeUndefined();
  });

  it('returns undefined when no existing record matches any conflicting field', () => {
    const record = {
      emailsField: { primaryEmail: 'nobody@example.com' },
    };

    const conflictingFieldGroups: ConflictingFieldGroup[] = [
      {
        baseFields: ['emailsField'],
        conflictingProperties: [
          {
            fullPath: 'emailsField.primaryEmail',
            column: 'emailsFieldPrimaryEmail',
          },
        ],
      },
    ];

    const id = getMatchingRecordId(
      record,
      conflictingFieldGroups,
      existingRecords,
    );

    expect(id).toBeUndefined();
  });

  it('returns the matching id if multiple conflicting fields point to the same existing record', () => {
    const record = {
      id: 'recordId1',
      uniqueText: 'alpha',
    };

    const conflictingFieldGroups: ConflictingFieldGroup[] = [
      {
        baseFields: ['id'],
        conflictingProperties: [{ fullPath: 'id', column: 'id' }],
      },
      {
        baseFields: ['uniqueText'],
        conflictingProperties: [
          { fullPath: 'uniqueText', column: 'uniqueText' },
        ],
      },
    ];

    const id = getMatchingRecordId(
      record,
      conflictingFieldGroups,
      existingRecords,
    );

    expect(id).toBe('recordId1');
  });

  it('throws when conflicting fields match different existing records', () => {
    const record = {
      uniqueText: 'alpha',
      emailsField: { primaryEmail: 'beta@example.com' },
    };

    const conflictingFieldGroups: ConflictingFieldGroup[] = [
      {
        baseFields: ['uniqueText'],
        conflictingProperties: [
          { fullPath: 'uniqueText', column: 'uniqueText' },
        ],
      },
      {
        baseFields: ['emailsField'],
        conflictingProperties: [
          {
            fullPath: 'emailsField.primaryEmail',
            column: 'emailsFieldPrimaryEmail',
          },
        ],
      },
    ];

    expect(() =>
      getMatchingRecordId(record, conflictingFieldGroups, existingRecords),
    ).toThrow();

    try {
      getMatchingRecordId(record, conflictingFieldGroups, existingRecords);
    } catch (error) {
      expect(error.code).toBe(
        CommonQueryRunnerExceptionCode.UPSERT_MULTIPLE_MATCHING_RECORDS_CONFLICT,
      );
    }
  });

  it('ignores deleted records for a unique field that does not cover them', () => {
    const conflictingFieldGroups: ConflictingFieldGroup[] = [
      {
        baseFields: ['uniqueText'],
        conflictingProperties: [
          { fullPath: 'uniqueText', column: 'uniqueText' },
        ],
        isIgnoringDeletedRecords: true,
      },
    ];
    const deletedRecord = {
      id: 'deletedRecordId',
      uniqueText: 'alpha',
      deletedAt: '2026-01-01T00:00:00.000Z',
    };

    expect(
      getMatchingRecordId({ uniqueText: 'alpha' }, conflictingFieldGroups, [
        deletedRecord,
      ]),
    ).toBeUndefined();
    expect(
      getMatchingRecordId({ uniqueText: 'alpha' }, conflictingFieldGroups, [
        deletedRecord,
        { id: 'liveRecordId', uniqueText: 'alpha' },
      ]),
    ).toBe('liveRecordId');
  });

  it('throws when the id targets a deleted record and a unique field matches a live one', () => {
    const conflictingFieldGroups: ConflictingFieldGroup[] = [
      {
        baseFields: ['id'],
        conflictingProperties: [{ fullPath: 'id', column: 'id' }],
      },
      {
        baseFields: ['uniqueText'],
        conflictingProperties: [
          { fullPath: 'uniqueText', column: 'uniqueText' },
        ],
        isIgnoringDeletedRecords: true,
      },
    ];

    expect(() =>
      getMatchingRecordId(
        { id: 'deletedRecordId', uniqueText: 'alpha' },
        conflictingFieldGroups,
        [
          { id: 'liveRecordId', uniqueText: 'alpha' },
          {
            id: 'deletedRecordId',
            uniqueText: 'alpha',
            deletedAt: '2026-01-01T00:00:00.000Z',
          },
        ],
      ),
    ).toThrow();
  });
});
