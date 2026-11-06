import { dropFieldsToUpdateFromCreateAndUpsertRecords } from 'src/database/commands/upgrade-version-command/2-57/utils/drop-fields-to-update-from-create-and-upsert-records.util';

const recordStep = ({
  type,
  input,
}: {
  type: string;
  input: Record<string, unknown>;
}) => ({
  id: `${type}-step`,
  name: type,
  type,
  valid: true,
  settings: {
    input,
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: 0 },
      continueOnFailure: { value: false },
    },
  },
});

describe('dropFieldsToUpdateFromCreateAndUpsertRecords', () => {
  it('drops the empty fieldsToUpdate the builder gave upsert record steps', () => {
    const result = dropFieldsToUpdateFromCreateAndUpsertRecords([
      recordStep({
        type: 'UPSERT_RECORD',
        input: {
          objectName: 'company',
          objectRecord: { name: 'Acme' },
          fieldsToUpdate: [],
        },
      }),
    ]);

    expect(result.hasChanged).toBe(true);
    expect(result.droppedNonEmptyFieldsToUpdate).toEqual([]);
    expect(result.steps).toEqual([
      recordStep({
        type: 'UPSERT_RECORD',
        input: { objectName: 'company', objectRecord: { name: 'Acme' } },
      }),
    ]);
  });

  it('drops and reports a non-empty fieldsToUpdate, which runs never applied', () => {
    const result = dropFieldsToUpdateFromCreateAndUpsertRecords([
      recordStep({
        type: 'CREATE_RECORD',
        input: {
          objectName: 'company',
          objectRecord: { name: 'Acme', domainName: 'acme.com' },
          fieldsToUpdate: ['name'],
        },
      }),
    ]);

    expect(result.hasChanged).toBe(true);
    expect(result.droppedNonEmptyFieldsToUpdate).toEqual([
      { stepId: 'CREATE_RECORD-step', fieldsToUpdate: ['name'] },
    ]);
    expect(result.steps).toEqual([
      recordStep({
        type: 'CREATE_RECORD',
        input: {
          objectName: 'company',
          objectRecord: { name: 'Acme', domainName: 'acme.com' },
        },
      }),
    ]);
  });

  it('keeps fieldsToUpdate on update record steps', () => {
    const steps = [
      recordStep({
        type: 'UPDATE_RECORD',
        input: {
          objectName: 'company',
          objectRecordId: '{{trigger.id}}',
          objectRecord: { name: 'Acme' },
          fieldsToUpdate: [],
        },
      }),
    ];

    const result = dropFieldsToUpdateFromCreateAndUpsertRecords(steps);

    expect(result.hasChanged).toBe(false);
    expect(result.steps).toBe(steps);
  });
});
