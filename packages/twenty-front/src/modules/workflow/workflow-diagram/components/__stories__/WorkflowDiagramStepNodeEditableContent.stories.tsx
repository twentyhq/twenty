import { Meta, StoryObj } from '@storybook/react';

import { WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { fn } from '@storybook/test';
import '@xyflow/react/dist/style.css';
import { CatalogDecorator, CatalogStory } from 'twenty-ui';
import { ReactflowDecorator } from '~/testing/decorators/ReactflowDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { WorkflowDiagramStepNodeEditableContent } from '../WorkflowDiagramStepNodeEditableContent';

const meta: Meta<typeof WorkflowDiagramStepNodeEditableContent> = {
  title: 'Modules/Workflow/WorkflowDiagramStepNodeEditableContent',
  component: WorkflowDiagramStepNodeEditableContent,
};

export default meta;

type Story = StoryObj<typeof WorkflowDiagramStepNodeEditableContent>;

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

export const All: CatalogStory<
  Story,
  typeof WorkflowDiagramStepNodeEditableContent
> = {
  args: {
    onDelete: fn(),
    variant: 'default',
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
          values: ALL_STEPS,
          props: (data: WorkflowDiagramStepNodeData) => ({ data }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator, ReactflowDecorator],
};

export const AllSelected: CatalogStory<
  Story,
  typeof WorkflowDiagramStepNodeEditableContent
> = {
  args: {
    onDelete: fn(),
    variant: 'default',
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
          values: ALL_STEPS,
          props: (data: WorkflowDiagramStepNodeData) => ({ data }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator, ReactflowDecorator],
};

export const AllSuccess: CatalogStory<
  Story,
  typeof WorkflowDiagramStepNodeEditableContent
> = {
  args: {
    onDelete: fn(),
    variant: 'success',
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
          values: ALL_STEPS,
          props: (data: WorkflowDiagramStepNodeData) => ({ data }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator, ReactflowDecorator],
};

export const AllSuccessSelected: CatalogStory<
  Story,
  typeof WorkflowDiagramStepNodeEditableContent
> = {
  args: {
    onDelete: fn(),
    variant: 'success',
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
          values: ALL_STEPS,
          props: (data: WorkflowDiagramStepNodeData) => ({ data }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator, ReactflowDecorator],
};

export const AllFailure: CatalogStory<
  Story,
  typeof WorkflowDiagramStepNodeEditableContent
> = {
  args: {
    onDelete: fn(),
    variant: 'failure',
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
          values: ALL_STEPS,
          props: (data: WorkflowDiagramStepNodeData) => ({ data }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator, ReactflowDecorator],
};

export const AllFailureSelected: CatalogStory<
  Story,
  typeof WorkflowDiagramStepNodeEditableContent
> = {
  args: {
    onDelete: fn(),
    variant: 'failure',
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
          values: ALL_STEPS,
          props: (data: WorkflowDiagramStepNodeData) => ({ data }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator, ReactflowDecorator],
};
