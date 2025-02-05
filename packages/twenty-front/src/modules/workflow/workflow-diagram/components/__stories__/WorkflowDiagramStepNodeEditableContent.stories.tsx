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

type WrapperProps = Omit<
  ComponentProps<typeof WorkflowDiagramStepNodeEditableContent>,
  'selected'
> & { state: ComponentState };

const Wrapper = ({ data, variant, onDelete, state }: WrapperProps) => {
  return (
    <div
      className={`selectable ${state === 'selected' ? 'selected' : state === 'hover' ? 'hover' : ''}`}
    >
      <WorkflowDiagramStepNodeEditableContent
        data={data}
        variant={variant}
        selected={state === 'selected'}
        onDelete={onDelete}
      />
    </div>
  );
};

const meta: Meta<typeof Wrapper> = {
  title: 'Modules/Workflow/WorkflowDiagramStepNodeEditableContent',
  component: Wrapper,
};

export default meta;

type Story = StoryObj<typeof Wrapper>;

const ALL_STEPS = [
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
] satisfies WorkflowDiagramStepNodeData[];

export const Catalog: CatalogStory<Story, typeof Wrapper> = {
  args: {
    onDelete: fn(),
  },
  parameters: {
    msw: graphqlMocks,
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
            'default',
            'empty',
            'success',
            'failure',
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
  decorators: [CatalogDecorator, ReactflowDecorator],
};
