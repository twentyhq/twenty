import { WorkflowActionType } from 'twenty-shared/workflow';

import { dropLegacyEmptyFieldsToUpdate } from 'src/engine/core-modules/workflow/utils/drop-legacy-empty-fields-to-update.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const recordStep = (
  type: WorkflowActionType,
  input: Record<string, unknown>,
): WorkflowAction =>
  ({
    id: 'step-1',
    name: 'Record step',
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
  }) as WorkflowAction;

describe('dropLegacyEmptyFieldsToUpdate', () => {
  it('drops an empty fieldsToUpdate from create and upsert record steps', () => {
    for (const type of [
      WorkflowActionType.CREATE_RECORD,
      WorkflowActionType.UPSERT_RECORD,
    ]) {
      expect(
        dropLegacyEmptyFieldsToUpdate([
          recordStep(type, {
            objectName: 'company',
            objectRecord: { name: 'Acme' },
            fieldsToUpdate: [],
          }),
        ]),
      ).toEqual([
        recordStep(type, {
          objectName: 'company',
          objectRecord: { name: 'Acme' },
        }),
      ]);
    }
  });

  it('keeps a non-empty fieldsToUpdate so that validation refuses it', () => {
    const steps = [
      recordStep(WorkflowActionType.UPSERT_RECORD, {
        objectName: 'company',
        objectRecord: { name: 'Acme' },
        fieldsToUpdate: ['name'],
      }),
    ];

    expect(dropLegacyEmptyFieldsToUpdate(steps)).toEqual(steps);
  });

  it('keeps fieldsToUpdate on update record steps', () => {
    const steps = [
      recordStep(WorkflowActionType.UPDATE_RECORD, {
        objectName: 'company',
        objectRecordId: '{{trigger.id}}',
        objectRecord: {},
        fieldsToUpdate: [],
      }),
    ];

    expect(dropLegacyEmptyFieldsToUpdate(steps)).toEqual(steps);
  });

  it('returns null steps as they are', () => {
    expect(dropLegacyEmptyFieldsToUpdate(null)).toBeNull();
  });
});
