import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import {
  type WorkflowCodeAction,
  type WorkflowEmptyAction,
} from '@/workflow/types/Workflow';
import { getStepOutputSchemaFamilyStateKey } from '@/workflow/utils/getStepOutputSchemaFamilyStateKey';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { WorkflowVariablesDropdown } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdown';
import { stepsOutputSchemaFamilyState } from '@/workflow/workflow-variables/states/stepsOutputSchemaFamilyState';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import { ComponentDecorator } from 'twenty-ui/testing';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedWorkflow } from '~/testing/mock-data/workflow';

const WORKFLOW_INSTANCE_ID = 'workflow-variables-story';
const WORKFLOW_VERSION_ID = '2eb13eb8-8fdb-4fb8-adb7-3ca86bd8f683';
const PREVIOUS_STEP_ID = 'bb3b3ff8-4e7f-47ee-af54-d12c9a725e70';
const CURRENT_STEP_ID = 'ff13b9a3-2801-4096-b6cb-df359bc04a26';

const OUTPUT_SCHEMA: StepOutputSchemaV2['outputSchema'] = {
  result: {
    isLeaf: false,
    label: 'Result',
    type: 'object',
    value: {
      companyName: {
        isLeaf: true,
        label: 'Company name',
        type: 'string',
        value: 'Acme',
      },
    },
  },
};

const STEP_SETTINGS = {
  input: {},
  outputSchema: {},
  errorHandlingOptions: {
    retryOnFailure: { value: 0 },
    continueOnFailure: { value: false },
  },
};

const CURRENT_STEP: WorkflowEmptyAction = {
  id: CURRENT_STEP_ID,
  name: 'Current step',
  type: 'EMPTY',
  valid: false,
  settings: STEP_SETTINGS,
};

const PREVIOUS_STEP: WorkflowCodeAction = {
  id: PREVIOUS_STEP_ID,
  name: 'Run code',
  type: 'CODE',
  valid: true,
  nextStepIds: [CURRENT_STEP_ID],
  settings: {
    ...STEP_SETTINGS,
    input: {
      logicFunctionId: 'd0eab6eb-8517-4db5-94e9-8bde5b95fb64',
      logicFunctionInput: {},
    },
    outputSchema: OUTPUT_SCHEMA,
  },
};

const initializeWorkflow = ({
  hasPreviousStep = false,
  hasAvailableVariables = true,
}: {
  hasPreviousStep?: boolean;
  hasAvailableVariables?: boolean;
} = {}) => {
  const triggerOutputSchema = hasAvailableVariables ? OUTPUT_SCHEMA : {};

  jotaiStore.set(
    flowComponentState.atomFamily({ instanceId: WORKFLOW_INSTANCE_ID }),
    {
      workflowVersionId: WORKFLOW_VERSION_ID,
      trigger: {
        type: 'MANUAL',
        name: 'Manual trigger',
        settings: { outputSchema: triggerOutputSchema },
        nextStepIds: [hasPreviousStep ? PREVIOUS_STEP_ID : CURRENT_STEP_ID],
      },
      steps: hasPreviousStep ? [PREVIOUS_STEP, CURRENT_STEP] : [CURRENT_STEP],
    },
  );
  jotaiStore.set(
    workflowSelectedNodeComponentState.atomFamily({
      instanceId: WORKFLOW_INSTANCE_ID,
    }),
    CURRENT_STEP_ID,
  );
  jotaiStore.set(
    workflowVisualizerWorkflowIdComponentState.atomFamily({
      instanceId: WORKFLOW_INSTANCE_ID,
    }),
    mockedWorkflow.id,
  );
  for (const step of [
    {
      id: TRIGGER_STEP_ID,
      name: 'Manual trigger',
      type: 'MANUAL',
      outputSchema: triggerOutputSchema,
    },
    {
      id: PREVIOUS_STEP_ID,
      name: PREVIOUS_STEP.name,
      type: PREVIOUS_STEP.type,
      outputSchema: OUTPUT_SCHEMA,
    },
  ] satisfies StepOutputSchemaV2[]) {
    jotaiStore.set(
      stepsOutputSchemaFamilyState.atomFamily(
        getStepOutputSchemaFamilyStateKey(WORKFLOW_VERSION_ID, step.id),
      ),
      step,
    );
  }
};

const meta = {
  title: 'Modules/Workflow/Variables/WorkflowVariablesDropdown',
  component: WorkflowVariablesDropdown,
  render: (args) => (
    <WorkflowVisualizerComponentInstanceContext.Provider
      value={{ instanceId: WORKFLOW_INSTANCE_ID }}
    >
      <WorkflowVariablesDropdown
        instanceId={args.instanceId}
        onVariableSelect={args.onVariableSelect}
        shouldDisplayRecordFields={args.shouldDisplayRecordFields}
        shouldDisplayRecordObjects={args.shouldDisplayRecordObjects}
        disabled={args.disabled}
        fieldTypesToExclude={args.fieldTypesToExclude}
        objectNameSingularsToSelect={args.objectNameSingularsToSelect}
      />
    </WorkflowVisualizerComponentInstanceContext.Provider>
  ),
  args: {
    instanceId: WORKFLOW_INSTANCE_ID,
    onVariableSelect: fn(),
    shouldDisplayRecordFields: true,
    shouldDisplayRecordObjects: false,
  },
  parameters: { msw: graphqlMocks },
  decorators: [WorkflowStepDecorator, ComponentDecorator, WorkspaceDecorator],
  beforeEach: () => initializeWorkflow(),
} satisfies Meta<typeof WorkflowVariablesDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ResetAfterEscape: Story = {
  play: async ({ canvasElement }) => {
    const trigger = await within(canvasElement).findByRole('button', {
      name: 'Insert variable',
    });
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(trigger);
    await userEvent.click(await body.findByRole('button', { name: 'Result' }));
    await userEvent.type(body.getByRole('searchbox'), 'Company');
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await expect(trigger).toHaveFocus();
    await userEvent.click(trigger);

    await expect(
      await body.findByRole('dialog', { name: 'Manual trigger' }),
    ).toBeVisible();
    await expect(body.getByRole('searchbox')).toHaveValue('');
    await expect(body.getByRole('button', { name: 'Result' })).toBeVisible();
    await expect(
      body.queryByRole('button', { name: /Company name/ }),
    ).not.toBeInTheDocument();
  },
};

export const ResetMultipleSteps: Story = {
  beforeEach: () => initializeWorkflow({ hasPreviousStep: true }),
  play: async ({ canvasElement }) => {
    const trigger = await within(canvasElement).findByRole('button', {
      name: 'Insert variable',
    });
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(trigger);
    await userEvent.click(
      await body.findByRole('button', { name: 'Run code' }),
    );
    await userEvent.click(body.getByRole('button', { name: 'Result' }));
    await userEvent.click(body.getByRole('button', { name: 'Close' }));
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await userEvent.click(trigger);

    await expect(
      await body.findByRole('dialog', { name: 'Select Step' }),
    ).toBeVisible();
    await expect(
      body.getByRole('button', { name: 'Manual trigger' }),
    ).toBeVisible();
  },
};

export const BackNavigation: Story = {
  play: async ({ canvasElement }) => {
    const trigger = await within(canvasElement).findByRole('button', {
      name: 'Insert variable',
    });
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(trigger);
    await userEvent.click(await body.findByRole('button', { name: 'Result' }));
    await expect(
      body.getByRole('button', { name: /Company name/ }),
    ).toBeVisible();
    await userEvent.click(body.getByRole('button', { name: 'Back' }));

    await expect(
      body.getByRole('dialog', { name: 'Manual trigger' }),
    ).toBeVisible();
    await expect(body.getByRole('searchbox')).toHaveFocus();
    await expect(body.getByRole('button', { name: 'Result' })).toBeVisible();
  },
};

export const NoAvailableVariables: Story = {
  beforeEach: () => initializeWorkflow({ hasAvailableVariables: false }),
  play: async ({ canvasElement }) => {
    const anchor = await waitFor(() => {
      const disabledAnchor = canvasElement.querySelector<HTMLElement>(
        '[data-variable-picker-disabled-anchor]',
      );
      assertIsDefinedOrThrow(disabledAnchor);
      return disabledAnchor;
    });

    await expect(
      within(canvasElement).queryByRole('button', { name: 'Insert variable' }),
    ).not.toBeInTheDocument();
    await userEvent.hover(anchor);
    await expect(
      await within(canvasElement.ownerDocument.body).findByRole('tooltip'),
    ).toHaveTextContent('No variables are available yet.');
  },
};
