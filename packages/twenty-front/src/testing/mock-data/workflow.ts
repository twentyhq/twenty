import { Workflow, WorkflowVersion } from '@/workflow/types/Workflow';

export const mockWorkflowVersion: WorkflowVersion = {
  __typename: 'WorkflowVersion',
  updatedAt: '2024-09-19T10:13:12.075Z',
  steps: null,
  createdAt: '2024-09-19T10:10:04.725Z',
  status: 'DRAFT',
  name: 'v1',
  id: 'f618843a-26be-4a54-a60f-f4ce88a594f0',
  trigger: {
    type: 'DATABASE_EVENT',
    settings: {
      eventName: 'note.created',
    },
  },
  deletedAt: null,
  workflowId: '200c1508-f102-4bb9-af32-eda55239ae61',
};

export const mockWorkflow: Workflow = {
  __typename: 'Workflow',
  id: '200c1508-f102-4bb9-af32-eda55239ae61',
  name: 'Test Workflow',
  versions: [mockWorkflowVersion],
  statuses: ['DRAFT'],
  lastPublishedVersionId: '',
  createdAt: '2024-09-19T10:10:04.725Z',
  updatedAt: '2024-09-19T10:13:12.075Z',
  deletedAt: null,
  position: 0,
};
