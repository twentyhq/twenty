import {
  type WorkflowAction,
  type WorkflowEmptyAction,
  type WorkflowIfElseAction,
} from '@/workflow/types/Workflow';
import { WorkflowEditActionEmpty } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowEditActionEmpty';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import {
  type Decorator,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { useStore } from 'jotai';
import { useEffect, useState } from 'react';
import { expect, fn, within } from 'storybook/test';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import {
  mockedWorkflow,
  mockedWorkflowVersion,
} from '~/testing/mock-data/workflow';

const EMPTY_STEP_ID = '2f4f1cbc-6f1e-4b9f-9f0e-0c1c3a1a2b3c';
const OTHER_STEP_ID = '9d0e5f2a-1b3c-4d5e-8f90-1a2b3c4d5e6f';

const DEFAULT_ACTION = {
  id: EMPTY_STEP_ID,
  name: 'Add an Action',
  type: 'EMPTY',
  valid: true,
  settings: {
    input: {},
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: {
        value: false,
      },
      continueOnFailure: {
        value: false,
      },
    },
  },
} satisfies WorkflowEmptyAction;

const createIfElseStep = (
  branches: WorkflowIfElseAction['settings']['input']['branches'],
) =>
  ({
    id: 'f0b1a2c3-d4e5-4f60-9a1b-2c3d4e5f6071',
    name: 'If/Else',
    type: 'IF_ELSE',
    valid: true,
    settings: {
      input: {
        stepFilterGroups: [],
        stepFilters: [],
        branches,
      },
      outputSchema: {},
      errorHandlingOptions: {
        retryOnFailure: {
          value: false,
        },
        continueOnFailure: {
          value: false,
        },
      },
    },
  }) as WorkflowIfElseAction;

const ELSE_IF_BRANCH_STEPS: WorkflowAction[] = [
  createIfElseStep([
    {
      id: 'branch-if',
      filterGroupId: 'group-if',
      nextStepIds: [OTHER_STEP_ID],
    },
    {
      id: 'branch-else-if',
      filterGroupId: 'group-else-if',
      nextStepIds: [EMPTY_STEP_ID],
    },
    { id: 'branch-else', nextStepIds: [OTHER_STEP_ID] },
  ]),
  DEFAULT_ACTION,
];

const IF_BRANCH_STEPS: WorkflowAction[] = [
  createIfElseStep([
    {
      id: 'branch-if',
      filterGroupId: 'group-if',
      nextStepIds: [EMPTY_STEP_ID],
    },
    { id: 'branch-else', nextStepIds: [OTHER_STEP_ID] },
  ]),
  DEFAULT_ACTION,
];

// SidePanelWorkflowEditStepType re-scopes the visualizer instance to the side
// panel workflow id, so the flow has to be seeded under that instance too.
const SidePanelFlowDecorator: Decorator = (Story, { args }) => {
  const store = useStore();
  const [isFlowSeeded, setIsFlowSeeded] = useState(false);
  const steps = (args.steps as WorkflowAction[] | null | undefined) ?? null;

  useEffect(() => {
    store.set(
      flowComponentState.atomFamily({
        instanceId: getWorkflowVisualizerComponentInstanceId({
          recordId: mockedWorkflow.id,
        }),
      }),
      {
        workflowVersionId: mockedWorkflowVersion.id,
        trigger: null,
        steps,
      },
    );
    setIsFlowSeeded(true);
  }, [store, steps]);

  return isFlowSeeded ? <Story /> : null;
};

const meta: Meta<typeof WorkflowEditActionEmpty> = {
  title: 'Modules/Workflow/Actions/Empty/EditAction',
  component: WorkflowEditActionEmpty,
  parameters: {
    msw: graphqlMocks,
  },
  args: {
    action: DEFAULT_ACTION,
  },
  decorators: [
    SidePanelFlowDecorator,
    WorkflowStepActionDrawerDecorator,
    WorkflowStepDecorator,
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
    RouterDecorator,
    WorkspaceDecorator,
  ],
};

export default meta;

type Story = StoryObj<typeof WorkflowEditActionEmpty>;

export const Default: Story = {
  args: {
    steps: ELSE_IF_BRANCH_STEPS,
    actionOptions: {
      onActionUpdate: fn(),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Create Record')).toBeVisible();
    expect(await canvas.findByText('Delete')).toBeVisible();
  },
};

export const NotDeletableInRequiredBranch: Story = {
  args: {
    steps: IF_BRANCH_STEPS,
    actionOptions: {
      onActionUpdate: fn(),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Create Record')).toBeVisible();
    expect(canvas.queryByText('Delete')).not.toBeInTheDocument();
  },
};

export const Readonly: Story = {
  args: {
    actionOptions: {
      readonly: true,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Create Record')).toBeVisible();
    expect(canvas.queryByText('Delete')).not.toBeInTheDocument();
  },
};
