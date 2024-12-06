import {
  WorkflowCodeAction,
  WorkflowRecordCRUDAction,
} from '@/workflow/types/Workflow';
import { isWorkflowRecordCreateAction } from '../isWorkflowRecordCreateAction';

describe('isWorkflowRecordCreateAction', () => {
  it('returns false when providing an action that is not Record Create', () => {
    const action: WorkflowCodeAction = {
      type: 'CODE',
      id: '',
      name: '',
      settings: {
        errorHandlingOptions: {
          continueOnFailure: {
            value: false,
          },
          retryOnFailure: {
            value: false,
          },
        },
        input: {
          serverlessFunctionId: '',
          serverlessFunctionVersion: '',
          serverlessFunctionInput: {},
        },
        outputSchema: {},
      },
      valid: true,
    };

    expect(isWorkflowRecordCreateAction(action)).toBe(false);
  });

  it('returns false for Record Update', () => {
    const action: WorkflowRecordCRUDAction = {
      type: 'RECORD_CRUD',
      id: '',
      name: '',
      settings: {
        errorHandlingOptions: {
          continueOnFailure: { value: false },
          retryOnFailure: { value: false },
        },
        input: {
          type: 'UPDATE',
          objectName: '',
          objectRecord: {},
          objectRecordId: '',
        },
        outputSchema: {},
      },
      valid: true,
    };

    expect(isWorkflowRecordCreateAction(action)).toBe(false);
  });

  it('returns true for Record Create', () => {
    const action: WorkflowRecordCRUDAction = {
      type: 'RECORD_CRUD',
      id: '',
      name: '',
      settings: {
        errorHandlingOptions: {
          continueOnFailure: { value: false },
          retryOnFailure: { value: false },
        },
        input: {
          type: 'CREATE',
          objectName: '',
          objectRecord: {},
        },
        outputSchema: {},
      },
      valid: true,
    };

    expect(isWorkflowRecordCreateAction(action)).toBe(true);
  });
});
