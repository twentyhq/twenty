import { Meta, StoryObj } from '@storybook/react';

import { WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { WorkflowDiagramNodeVariant } from '@/workflow/workflow-diagram/types/WorkflowDiagramNodeVariant';
import { fn } from '@storybook/test';
import '@xyflow/react/dist/style.css';
import { ComponentProps } from 'react';
import { CatalogDecorator, CatalogStory } from 'twenty-ui';
import { ReactflowDecorator } from '~/testing/decorators/ReactflowDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { WorkflowDiagramStepNodeEditableContent } from '../WorkflowDiagramStepNodeEditableContent';

type ComponentState = 'default' | 'hover' | 'selected';

type WrapperProps = ComponentProps<
  typeof WorkflowDiagramStepNodeEditableContent
> & { state: ComponentState };

const Wrapper = (_props: WrapperProps) => {
  return <div></div>;
};

const meta: Meta<WrapperProps> = {
  title: 'Modules/Workflow/WorkflowDiagramStepNodeEditableContent',
  component: WorkflowDiagramStepNodeEditableContent,
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

type Story = StoryObj<typeof Wrapper>;

const ALL_STEPS = [
  {
    nodeType: 'trigger',
    triggerType: 'DATABASE_EVENT',
    name: 'Record is Created',
    isLeafNode: true,
  },
  {
    nodeType: 'trigger',
    triggerType: 'MANUAL',
    name: 'Manual',
    isLeafNode: true,
  },
  {
    nodeType: 'action',
    actionType: 'CREATE_RECORD',
    name: 'Create Record',
    isLeafNode: true,
  },
  {
    nodeType: 'action',
    actionType: 'UPDATE_RECORD',
    name: 'Update Record',
    isLeafNode: true,
  },
  {
    nodeType: 'action',
    actionType: 'DELETE_RECORD',
    name: 'Delete Record',
    isLeafNode: true,
  },
  {
    nodeType: 'action',
    actionType: 'SEND_EMAIL',
    name: 'Send Email',
    isLeafNode: true,
  },
  {
    nodeType: 'action',
    actionType: 'CODE',
    name: 'Code',
    isLeafNode: true,
  },
] satisfies WorkflowDiagramStepNodeData[];

export const Catalog: CatalogStory<Story, typeof Wrapper> = {
  args: {
    onDelete: fn(),
  },
  parameters: {
    pseudo: { hover: ['.hover'] },
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
          values: ALL_STEPS,
          props: (data: WorkflowDiagramStepNodeData) => ({ data }),
        },
        {
          name: 'variant',
          values: [
            'empty',
            'default',
            'success',
            'failure',
            'not-executed',
          ] satisfies WorkflowDiagramNodeVariant[],
          props: (variant: WorkflowDiagramNodeVariant) => ({ variant }),
        },
        {
          name: 'state',
          values: ['default', 'hover', 'selected'] satisfies ComponentState[],
          props: (state: ComponentState) => ({ state }),
        },
      ],
    },
  },
  decorators: [
    (Story, { args }) => {
      return (
        <div
          className={`selectable ${args.state === 'selected' ? 'selected' : args.state === 'hover' ? 'workflow-node-container hover' : ''}`}
        >
          <Story />
        </div>
      );
    },
    CatalogDecorator,
    ReactflowDecorator,
  ],
};

export const IsNotLeafNode: Story = {
  args: {
    data: {
      ...ALL_STEPS[0],
      isLeafNode: false,
    },
    state: 'default',
    variant: 'default',
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative' }}>
        <Story />
      </div>
    ),
    ReactflowDecorator,
  ],
};
