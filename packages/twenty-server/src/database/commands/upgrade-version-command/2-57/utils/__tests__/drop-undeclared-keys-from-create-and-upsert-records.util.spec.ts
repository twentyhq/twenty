import { dropUndeclaredKeysFromCreateAndUpsertRecords } from 'src/database/commands/upgrade-version-command/2-57/utils/drop-undeclared-keys-from-create-and-upsert-records.util';

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

describe('dropUndeclaredKeysFromCreateAndUpsertRecords', () => {
  it('drops the empty fieldsToUpdate the builder gave upsert record steps', () => {
    const result = dropUndeclaredKeysFromCreateAndUpsertRecords([
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
    expect(result.droppedInputKeys).toEqual([
      { stepId: 'UPSERT_RECORD-step', keys: ['fieldsToUpdate'] },
    ]);
    expect(result.steps).toEqual([
      recordStep({
        type: 'UPSERT_RECORD',
        input: { objectName: 'company', objectRecord: { name: 'Acme' } },
      }),
    ]);
  });

  it('drops and reports every undeclared key, which runs never applied', () => {
    const result = dropUndeclaredKeysFromCreateAndUpsertRecords([
      recordStep({
        type: 'CREATE_RECORD',
        input: {
          objectName: 'company',
          objectRecord: { name: 'Acme', domainName: 'acme.com' },
          fieldsToUpdate: ['name'],
          outputSchema: {},
        },
      }),
    ]);

    expect(result.hasChanged).toBe(true);
    expect(result.droppedInputKeys).toEqual([
      { stepId: 'CREATE_RECORD-step', keys: ['fieldsToUpdate', 'outputSchema'] },
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

  it('leaves a create record step with only its declared keys untouched', () => {
    const steps = [
      recordStep({
        type: 'CREATE_RECORD',
        input: { objectName: 'company', objectRecord: { name: 'Acme' } },
      }),
    ];

    const result = dropUndeclaredKeysFromCreateAndUpsertRecords(steps);

    expect(result.hasChanged).toBe(false);
    expect(result.steps).toBe(steps);
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

    const result = dropUndeclaredKeysFromCreateAndUpsertRecords(steps);

    expect(result.hasChanged).toBe(false);
    expect(result.steps).toBe(steps);
  });
});
