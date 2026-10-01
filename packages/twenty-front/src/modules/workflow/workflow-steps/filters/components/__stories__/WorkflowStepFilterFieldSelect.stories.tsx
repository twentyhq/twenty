import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { WorkflowStepFilterFieldSelect } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterFieldSelect';
import { WorkflowStepFilterDecorator } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/decorators/WorkflowStepFilterDecorator';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type StepFilter, ViewFilterOperand } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const onFilterSettingsUpdate = fn();

const DEFAULT_STEP_FILTER: StepFilter = {
  id: 'filter-1',
  stepFilterGroupId: 'filter-group-1',
  stepOutputKey: '',
  type: 'text',
  operand: ViewFilterOperand.IS,
  value: '',
  positionInStepFilterGroup: 0,
};

const meta: Meta<typeof WorkflowStepFilterFieldSelect> = {
  title: 'Modules/Workflow/Actions/Filter/WorkflowStepFilterFieldSelect',
  component: WorkflowStepFilterFieldSelect,
  parameters: {
    msw: graphqlMocks,
  },
  args: {
    stepFilter: DEFAULT_STEP_FILTER,
  },
  decorators: [
    (Story, context) => (
      <WorkflowStepFilterContext.Provider
        value={{
          stepId: 'step-id',
          readonly: context.parameters.readonly,
          onFilterSettingsUpdate,
        }}
      >
        <Story />
      </WorkflowStepFilterContext.Provider>
    ),
    WorkflowStepActionDrawerDecorator,
    WorkflowStepDecorator,
    ComponentDecorator,
    WorkspaceDecorator,
    WorkflowStepFilterDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof WorkflowStepFilterFieldSelect>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    onFilterSettingsUpdate.mockClear();
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole('button', {
      name: 'Select a field from a previous step',
    });

    await userEvent.click(trigger);
    const search = await body.findByRole('searchbox');
    await userEvent.type(search, 'name');
    await userEvent.keyboard('{Enter}');

    await waitFor(() =>
      expect(onFilterSettingsUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          stepFilters: expect.arrayContaining([
            expect.objectContaining({
              id: 'filter-1',
              stepOutputKey: expect.stringContaining('{{trigger.'),
            }),
          ]),
        }),
      ),
    );
    await waitFor(() =>
      expect(body.queryByRole('searchbox')).not.toBeInTheDocument(),
    );
    await expect(trigger).toHaveFocus();
  },
};

export const Readonly: Story = {
  parameters: { readonly: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText('Select a field from a previous step'),
    ).toBeVisible();
    await expect(
      canvas.queryByRole('button', {
        name: 'Select a field from a previous step',
      }),
    ).not.toBeInTheDocument();
  },
};

export const BrokenReference: Story = {
  args: {
    stepFilter: { ...DEFAULT_STEP_FILTER, stepOutputKey: 'trigger.name' },
  },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText(
        'Broken field reference. Select the field again to fix this condition.',
      ),
    ).toBeVisible();
  },
};
