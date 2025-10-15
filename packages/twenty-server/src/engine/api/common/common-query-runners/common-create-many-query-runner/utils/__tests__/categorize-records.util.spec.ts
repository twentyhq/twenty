import { type ObjectRecord } from 'twenty-shared/types';

import { type PartialObjectRecordWithId } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/types/partial-object-record-with-id.type';
import { categorizeRecords } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/utils/categorize-records.util';

describe('categorizeRecords', () => {
  const conflictingFields = [
    { baseField: 'id', fullPath: 'id', column: 'id' },
    {
      baseField: 'uniqueText',
      fullPath: 'uniqueText',
      column: 'uniqueText',
    },
    {
      baseField: 'emailsField',
      fullPath: 'emailsField.primaryEmail',
      column: 'emailsFieldPrimaryEmail',
    },
  ];

  const existingRecords: PartialObjectRecordWithId[] = [
    {
      id: 'r1',
      uniqueText: 'alpha',
      emailsField: { primaryEmail: 'alpha@example.com' },
    },
    {
      id: 'r2',
      uniqueText: 'beta',
      emailsField: { primaryEmail: 'beta@example.com' },
    },
  ];

  it('return records to insert only', () => {
    const records: Partial<ObjectRecord>[] = [
      { uniqueText: 'gamma' },
      { emailsField: { primaryEmail: 'nobody@example.com' } },
    ];

    const { recordsToInsert, recordsToUpdate } = categorizeRecords(
      records,
      conflictingFields,
      existingRecords,
    );

    expect(recordsToUpdate).toHaveLength(0);
    expect(recordsToInsert).toHaveLength(2);
    expect(recordsToInsert).toEqual(records);
  });

  it('return records to update only', () => {
    const records: Partial<ObjectRecord>[] = [
      { uniqueText: 'alpha', name: 'Updated A' },
      { emailsField: { primaryEmail: 'beta@example.com' }, name: 'Updated B' },
    ];

    const { recordsToInsert, recordsToUpdate } = categorizeRecords(
      records,
      conflictingFields,
      existingRecords,
    );

    expect(recordsToInsert).toHaveLength(0);
    expect(recordsToUpdate).toHaveLength(2);

    const ids = recordsToUpdate.map((r) => r.id);

    expect(ids.sort()).toEqual(['r1', 'r2']);

    expect(recordsToUpdate).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'r1',
          name: 'Updated A',
          uniqueText: 'alpha',
        }),
        expect.objectContaining({ id: 'r2', name: 'Updated B' }),
      ]),
    );
  });

  it('return records to insert and update', () => {
    const records: Partial<ObjectRecord>[] = [
      { uniqueText: 'alpha' },
      { uniqueText: 'gamma' },
      { emailsField: { primaryEmail: 'beta@example.com' } },
    ];

    const { recordsToInsert, recordsToUpdate } = categorizeRecords(
      records,
      conflictingFields,
      existingRecords,
    );

    expect(recordsToUpdate).toHaveLength(2);
    expect(recordsToInsert).toHaveLength(1);

    expect(recordsToInsert[0]).toEqual({ uniqueText: 'gamma' });

    expect(recordsToUpdate).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'r1', uniqueText: 'alpha' }),
        expect.objectContaining({ id: 'r2' }),
      ]),
    );
  });
});
