import { WorkflowStep, WorkflowStepType } from '@/workflow/types/Workflow';
import { assertUnreachable } from '@/workflow/utils/assertUnreachable';
import { v4 } from 'uuid';

export const getStepDefaultDefinition = (
  type: WorkflowStepType,
): WorkflowStep => {
  const newStepId = v4();

  switch (type) {
    case 'CODE': {
      return {
        id: newStepId,
        name: 'Code',
        type: 'CODE',
        valid: false,
        settings: {
          input: {
            serverlessFunctionId: '',
            serverlessFunctionVersion: '',
            serverlessFunctionInput: {},
          },
          outputSchema: {},
          errorHandlingOptions: {
            continueOnFailure: {
              value: false,
            },
            retryOnFailure: {
              value: false,
            },
          },
        },
      };
    }
    case 'SEND_EMAIL': {
      return {
        id: newStepId,
        name: 'Send Email',
        type: 'SEND_EMAIL',
        valid: false,
        settings: {
          input: {
            connectedAccountId: '',
            email: '',
            subject: '',
            body: '',
          },
          outputSchema: {},
          errorHandlingOptions: {
            continueOnFailure: {
              value: false,
            },
            retryOnFailure: {
              value: false,
            },
          },
        },
      };
    }
    default: {
      return assertUnreachable(type, `Unknown type: ${type}`);
    }
  }
};
