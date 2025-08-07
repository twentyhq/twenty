import { Meta, StoryObj } from '@storybook/react';

import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { WorkflowDiagramNodeVariant } from '@/workflow/workflow-diagram/types/WorkflowDiagramNodeVariant';
import { fn } from '@storybook/test';
import '@xyflow/react/dist/style.css';
import { ComponentProps } from 'react';
import { RecoilRoot } from 'recoil';
import { CatalogDecorator, CatalogStory } from 'twenty-ui/testing';
import { ReactflowDecorator } from '~/testing/decorators/ReactflowDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { WorkflowDiagramStepNodeEditableContent } from '../WorkflowDiagramStepNodeEditableContent';

type ComponentState = 'default' | 'hover' | 'selected';

type WrapperProps = ComponentProps<
  typeof WorkflowDiagramStepNodeEditableContent
> & { state: ComponentState };

const meta: Meta<WrapperProps> = {
  title: 'Modules/Workflow/WorkflowDiagramStepNodeEditableContent',
  component: WorkflowDiagramStepNodeEditableContent,
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

type Story = StoryObj<WrapperProps>;

const ALL_STEPS = [
  {
    nodeType: 'trigger',
    triggerType: 'DATABASE_EVENT',
    name: 'Record is Created',
    hasNextStepIds: true,
    stepId: 'trigger',
    position: {
      x: 0,
      y: 0,
    },
  },
  {
    nodeType: 'condition',
    hasNextStepIds: true,
    name: 'Code - Condition',
    stepId: 'step_1',
    position: {
      x: 0,
      y: 0,
    },
  },
  {
    nodeType: 'action',
    actionType: 'SEND_EMAIL',
    name: 'Send Email',
    hasNextStepIds: false,
    stepId: 'step_2',
    position: {
      x: 0,
      y: 0,
    },
  },
  {
    nodeType: 'action',
    actionType: 'CODE',
    name: 'Code - Action',
    hasNextStepIds: false,
    stepId: 'step_3',
    position: {
      x: 0,
      y: 0,
    },
  },
  {
    nodeType: 'action',
    actionType: 'CREATE_RECORD',
    name: 'Create Record',
    hasNextStepIds: false,
    stepId: 'step_4',
    position: {
      x: 0,
      y: 0,
    },
  },
  {
    nodeType: 'action',
    actionType: 'UPDATE_RECORD',
    name: 'Update Record',
    hasNextStepIds: false,
    stepId: 'step_5',
    position: {
      x: 0,
      y: 0,
    },
  },
  {
    nodeType: 'action',
    actionType: 'DELETE_RECORD',
    name: 'Delete Record',
    hasNextStepIds: false,
    stepId: 'step_6',
    position: {
      x: 0,
      y: 0,
    },
  },
  {
    nodeType: 'condition',
    hasNextStepIds: true,
    name: 'A very long condition name that tests the way the name is rendered',
    stepId: 'step_7',
    position: {
      x: 0,
      y: 0,
    },
  },
  {
    nodeType: 'action',
    actionType: 'CODE',
    name: 'A very very long action name that tests the way the name is rendered in the interface',
    hasNextStepIds: false,
    stepId: 'step_8',
    position: {
      x: 0,
      y: 0,
    },
  },
  {
    nodeType: 'action',
    actionType: 'CODE',
    name: 'A very very long action name that tests the way the name is rendered in the interface and the way it wraps',
    hasNextStepIds: false,
    stepId: 'step_9',
    position: {
      x: 0,
      y: 0,
    },
  },
] satisfies WorkflowDiagramStepNodeData[];

// For the catalog, we'll use the actual component without the wrapper state
export const Catalog: CatalogStory<StoryObj<typeof WorkflowDiagramStepNodeEditableContent>, typeof WorkflowDiagramStepNodeEditableContent> = {
  args: {
    onDelete: fn(),
  },
  parameters: {
    pseudo: { hover: ['.hover'] },
    catalog: {
      options: {
        elementContainer: {
          width: 240,
          height: 80,
        },
      },
      dimensions: [
        {
          name: 'data',
          values: ALL_STEPS,
          props: (data: WorkflowDiagramStepNodeData) => ({ data }),
        },
        {
          name: 'variant',
          values: [
            'default',
            'placeholder',
            'selected',
            'notSelected',
          ] satisfies WorkflowDiagramNodeVariant[],
          props: (variant: WorkflowDiagramNodeVariant) => ({ variant }),
        },
      ],
    },
  },
  decorators: [
    (Story, { args }) => (
      <WorkflowVisualizerComponentInstanceContext.Provider
        value={{
          instanceId: 'story-workflow-visualizer',
        }}
      >
        <RecoilRoot>
          <ReactflowDecorator>
            <Story {...args} />
          </ReactflowDecorator>
        </RecoilRoot>
      </WorkflowVisualizerComponentInstanceContext.Provider>
    ),
    CatalogDecorator,
  ],
};