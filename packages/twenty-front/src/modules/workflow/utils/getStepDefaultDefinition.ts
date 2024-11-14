import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { WorkflowStep, WorkflowStepType } from '@/workflow/types/Workflow';
import { assertUnreachable } from '@/workflow/utils/assertUnreachable';
import { v4 } from 'uuid';

export const getStepDefaultDefinition = ({
  type,
  activeObjectMetadataItems,
}: {
  type: WorkflowStepType;
  activeObjectMetadataItems: ObjectMetadataItem[];
}): WorkflowStep => {
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
    case 'RECORD_CRUD.CREATE': {
      return {
        id: newStepId,
        name: 'Record Create',
        type: 'RECORD_CRUD',
        valid: false,
        settings: {
          input: {
            type: 'CREATE',
            objectName: activeObjectMetadataItems[0].nameSingular,
            objectRecord: {},
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
    case 'RECORD_CRUD.DELETE':
    case 'RECORD_CRUD.UPDATE': {
      throw new Error('Not implemented yet');
    }
    default: {
      return assertUnreachable(type, `Unknown type: ${type}`);
    }
  }
};
