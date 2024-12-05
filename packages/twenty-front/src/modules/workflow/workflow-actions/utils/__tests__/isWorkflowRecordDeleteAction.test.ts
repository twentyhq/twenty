import {
  WorkflowCodeAction,
  WorkflowRecordCRUDAction,
} from '@/workflow/types/Workflow';
import { isWorkflowRecordDeleteAction } from '../isWorkflowRecordDeleteAction';

it('returns false when providing an action that is not Record Delete', () => {
  const codeAction: WorkflowCodeAction = {
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

  expect(isWorkflowRecordDeleteAction(codeAction)).toBe(false);
});

it('returns false for Record Update', () => {
  const codeAction: WorkflowRecordCRUDAction = {
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

  expect(isWorkflowRecordDeleteAction(codeAction)).toBe(false);
});

it('returns true for Record Delete', () => {
  const codeAction: WorkflowRecordCRUDAction = {
    type: 'RECORD_CRUD',
    id: '',
    name: '',
    settings: {
      errorHandlingOptions: {
        continueOnFailure: { value: false },
        retryOnFailure: { value: false },
      },
      input: {
        type: 'DELETE',
        objectName: '',
        objectRecordId: '',
      },
      outputSchema: {},
    },
    valid: true,
  };

  expect(isWorkflowRecordDeleteAction(codeAction)).toBe(true);
});
