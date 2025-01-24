import { Meta, StoryObj } from '@storybook/react';

import { WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { fn } from '@storybook/test';
import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CatalogDecorator, CatalogStory } from 'twenty-ui';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { WorkflowDiagramStepNodeEditableContent } from '../WorkflowDiagramStepNodeEditableContent';

const meta: Meta<typeof WorkflowDiagramStepNodeEditableContent> = {
  title: 'Modules/Workflow/WorkflowDiagramStepNodeEditableContent',
  component: WorkflowDiagramStepNodeEditableContent,
};

export default meta;

type Story = StoryObj<typeof WorkflowDiagramStepNodeEditableContent>;

export const All: CatalogStory<
  Story,
  typeof WorkflowDiagramStepNodeEditableContent
> = {
  args: {
    onDelete: fn(),
    selected: false,
  },
  parameters: {
    msw: graphqlMocks,
    catalog: {
      options: {
        elementContainer: {
          width: 250,
          style: { position: 'relative' },
        },
      },
      dimensions: [
        {
          name: 'step type',
          values: [
            {
              nodeType: 'trigger',
              triggerType: 'DATABASE_EVENT',
              name: 'Record is Created',
            },
            { nodeType: 'trigger', triggerType: 'MANUAL', name: 'Manual' },
            {
              nodeType: 'action',
              actionType: 'CREATE_RECORD',
              name: 'Create Record',
            },
            {
              nodeType: 'action',
              actionType: 'UPDATE_RECORD',
              name: 'Update Record',
            },
            {
              nodeType: 'action',
              actionType: 'DELETE_RECORD',
              name: 'Delete Record',
            },
            {
              nodeType: 'action',
              actionType: 'SEND_EMAIL',
              name: 'Send Email',
            },
            { nodeType: 'action', actionType: 'CODE', name: 'Code' },
          ] satisfies WorkflowDiagramStepNodeData[],
          props: (data: WorkflowDiagramStepNodeData) => ({ data }),
        },
      ],
    },
  },
  decorators: [
    CatalogDecorator,
    (Story) => {
      return (
        <ReactFlowProvider>
          <Story />
        </ReactFlowProvider>
      );
    },
  ],
};
export const AllSelected: CatalogStory<
  Story,
  typeof WorkflowDiagramStepNodeEditableContent
> = {
  args: {
    onDelete: fn(),
    selected: true,
  },
  parameters: {
    msw: graphqlMocks,
    catalog: {
      options: {
        elementContainer: {
          width: 250,
          style: { position: 'relative' },
          className: 'selectable selected',
        },
      },
      dimensions: [
        {
          name: 'step type',
          values: [
            {
              nodeType: 'trigger',
              triggerType: 'DATABASE_EVENT',
              name: 'Record is Created',
            },
            { nodeType: 'trigger', triggerType: 'MANUAL', name: 'Manual' },
            {
              nodeType: 'action',
              actionType: 'CREATE_RECORD',
              name: 'Create Record',
            },
            {
              nodeType: 'action',
              actionType: 'UPDATE_RECORD',
              name: 'Update Record',
            },
            {
              nodeType: 'action',
              actionType: 'DELETE_RECORD',
              name: 'Delete Record',
            },
            {
              nodeType: 'action',
              actionType: 'SEND_EMAIL',
              name: 'Send Email',
            },
            { nodeType: 'action', actionType: 'CODE', name: 'Code' },
          ] satisfies WorkflowDiagramStepNodeData[],
          props: (data: WorkflowDiagramStepNodeData) => ({ data }),
        },
      ],
    },
  },
  decorators: [
    CatalogDecorator,
    (Story) => {
      return (
        <ReactFlowProvider>
          <Story />
        </ReactFlowProvider>
      );
    },
  ],
};
