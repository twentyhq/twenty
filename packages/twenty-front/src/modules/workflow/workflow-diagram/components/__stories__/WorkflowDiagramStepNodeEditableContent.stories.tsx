import { Meta, StoryObj } from '@storybook/react';

import { WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { WorkflowDiagramNodeVariant } from '@/workflow/workflow-diagram/types/WorkflowDiagramNodeVariant';
import { fn } from '@storybook/test';
import '@xyflow/react/dist/style.css';
import { ComponentProps } from 'react';
import { CatalogDecorator, CatalogStory } from 'twenty-ui/testing';
import { ReactflowDecorator } from '~/testing/decorators/ReactflowDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { WorkflowDiagramStepNodeEditableContent } from '../WorkflowDiagramStepNodeEditableContent';
import { RecoilRoot } from 'recoil';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

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
    hasNextStepIds: true,
    stepId: 'trigger',
    position: {
      x: 0,
      y: 0,
    },
  },
  {
    nodeType: 'trigger',
    triggerType: 'MANUAL',
    name: 'Manual',
    hasNextStepIds: true,
    stepId: 'step1',
    position: {
      x: 0,
      y: 150,
    },
  },
  {
    nodeType: 'action',
    actionType: 'CREATE_RECORD',
    name: 'Create Record',
    hasNextStepIds: true,
    stepId: 'step2',
    position: {
      x: 0,
      y: 300,
    },
  },
  {
    nodeType: 'action',
    actionType: 'UPDATE_RECORD',
    name: 'Update Record',
    hasNextStepIds: true,
    stepId: 'step3',
    position: {
      x: 0,
      y: 450,
    },
  },
  {
    nodeType: 'action',
    actionType: 'DELETE_RECORD',
    name: 'Delete Record',
    hasNextStepIds: true,
    stepId: 'step4',
    position: {
      x: 0,
      y: 600,
    },
  },
  {
    nodeType: 'action',
    actionType: 'SEND_EMAIL',
    name: 'Send Email',
    hasNextStepIds: true,
    stepId: 'step5',
    position: {
      x: 0,
      y: 750,
    },
  },
  {
    nodeType: 'action',
    actionType: 'CODE',
    name: 'Code',
    hasNextStepIds: true,
    stepId: 'step6',
    position: {
      x: 0,
      y: 900,
    },
  },
  {
    nodeType: 'action',
    actionType: 'HTTP_REQUEST',
    name: 'HTTP Request',
    hasNextStepIds: true,
    stepId: 'step7',
    position: {
      x: 0,
      y: 1050,
    },
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
            'running',
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
          <RecoilRoot>
            <WorkflowVisualizerComponentInstanceContext.Provider
              value={{ instanceId: 'workflow-visualizer-instance-id' }}
            >
              <Story />
            </WorkflowVisualizerComponentInstanceContext.Provider>
          </RecoilRoot>
        </div>
      );
    },
    CatalogDecorator,
    ReactflowDecorator,
  ],
};
