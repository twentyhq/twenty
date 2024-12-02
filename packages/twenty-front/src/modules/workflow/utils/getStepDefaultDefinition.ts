import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { WorkflowStep, WorkflowStepType } from '@/workflow/types/Workflow';
import { assertUnreachable } from '@/workflow/utils/assertUnreachable';
import { v4 } from 'uuid';

const BASE_DEFAULT_STEP_SETTINGS = {
  outputSchema: {},
  errorHandlingOptions: {
    continueOnFailure: {
      value: false,
    },
    retryOnFailure: {
      value: false,
    },
  },
};

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
          ...BASE_DEFAULT_STEP_SETTINGS,
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
          ...BASE_DEFAULT_STEP_SETTINGS,
        },
      };
    }
    case 'RECORD_CRUD.CREATE': {
      return {
        id: newStepId,
        name: 'Create Record',
        type: 'RECORD_CRUD',
        valid: false,
        settings: {
          input: {
            type: 'CREATE',
            objectName: activeObjectMetadataItems[0].nameSingular,
            objectRecord: {},
          },
          ...BASE_DEFAULT_STEP_SETTINGS,
        },
      };
    }
    case 'RECORD_CRUD.UPDATE':
      return {
        id: newStepId,
        name: 'Update Record',
        type: 'RECORD_CRUD',
        valid: false,
        settings: {
          input: {
            type: 'UPDATE',
            objectName: activeObjectMetadataItems[0].nameSingular,
            objectRecordId: '',
            objectRecord: {},
          },
          ...BASE_DEFAULT_STEP_SETTINGS,
        },
      };
    case 'RECORD_CRUD.DELETE': {
      throw new Error('Not implemented yet');
    }
    default: {
      return assertUnreachable(type, `Unknown type: ${type}`);
    }
  }
};
