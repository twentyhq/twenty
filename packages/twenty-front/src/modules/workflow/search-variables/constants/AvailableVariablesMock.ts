import { WorkflowStepMock } from '@/workflow/search-variables/types/WorkflowStepMock';

export const AVAILABLE_VARIABLES_MOCK: WorkflowStepMock[] = [
  {
    id: '1',
    name: 'Person is Created',
    output: {
      userId: '1',
      recordId: '123',
      objectMetadataItem: {
        id: '1234',
        nameSingular: 'person',
        namePlural: 'people',
      },
      properties: {
        after: {
          name: 'John Doe',
          email: 'john.doe@email.com',
        },
      },
    },
  },
  {
    id: '2',
    name: 'Send Email',
    output: {
      success: true,
    },
  },
];
