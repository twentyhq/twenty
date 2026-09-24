import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { WorkflowStepFilterAddFilterRuleSelect } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterAddFilterRuleSelect';
import { WorkflowStepFilterGroupOptionsDropdown } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterGroupOptionsDropdown';
import { WorkflowStepFilterOptionsDropdown } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterOptionsDropdown';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';
import { currentStepFilterGroupsComponentState } from '@/workflow/workflow-steps/filters/states/currentStepFilterGroupsComponentState';
import { currentStepFiltersComponentState } from '@/workflow/workflow-steps/filters/states/currentStepFiltersComponentState';
import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';
import { WorkflowStepFilterDecorator } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/decorators/WorkflowStepFilterDecorator';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, mocked, userEvent, waitFor, within } from 'storybook/test';
import {
  type StepFilter,
  type StepFilterGroup,
  StepLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';

const STEP_ID = 'step-id';
const FILTER_GROUP: StepFilterGroup = {
  id: 'filter-group',
  logicalOperator: StepLogicalOperator.AND,
  positionInStepFilterGroup: 0,
};
const FILTER: StepFilter = {
  id: 'filter',
  type: 'unknown',
  value: '',
  operand: ViewFilterOperand.IS,
  stepOutputKey: '',
  stepFilterGroupId: FILTER_GROUP.id,
  positionInStepFilterGroup: 3,
};

type WorkflowStepFilterMenusProps = {
  readonly: boolean;
  onFilterSettingsUpdate: (filterSettings: FilterSettings) => void;
};

const WorkflowStepFilterMenus = ({
  readonly,
  onFilterSettingsUpdate,
}: WorkflowStepFilterMenusProps) => (
  <WorkflowStepFilterContext.Provider
    value={{ stepId: STEP_ID, readonly, onFilterSettingsUpdate }}
  >
    <WorkflowStepFilterOptionsDropdown stepFilterId={FILTER.id} />
    <WorkflowStepFilterGroupOptionsDropdown
      stepFilterGroupId={FILTER_GROUP.id}
    />
    <WorkflowStepFilterAddFilterRuleSelect stepFilterGroup={FILTER_GROUP} />
  </WorkflowStepFilterContext.Provider>
);

const meta: Meta<typeof WorkflowStepFilterMenus> = {
  title: 'Modules/Workflow/Filters/WorkflowStepFilterMenus',
  component: WorkflowStepFilterMenus,
  decorators: [ComponentDecorator, WorkflowStepFilterDecorator],
  args: { readonly: false, onFilterSettingsUpdate: fn() },
  beforeEach: () => {
    jotaiStore.set(
      currentStepFilterGroupsComponentState.atomFamily({ instanceId: STEP_ID }),
      [FILTER_GROUP],
    );
    jotaiStore.set(
      currentStepFiltersComponentState.atomFamily({ instanceId: STEP_ID }),
      [FILTER],
    );
  },
};

export default meta;
type Story = StoryObj<typeof WorkflowStepFilterMenus>;

export const ReadOnly: Story = {
  args: { readonly: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    const filterTrigger = canvas.getByRole('button', {
      name: 'Step filter options',
    });
    const groupTrigger = canvas.getByRole('button', {
      name: 'Step filter group options',
    });

    await expect(filterTrigger).toBeDisabled();
    await expect(groupTrigger).toBeDisabled();
    await userEvent.click(filterTrigger);
    await userEvent.click(groupTrigger);
    await expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
    await expect(args.onFilterSettingsUpdate).not.toHaveBeenCalled();
  },
};

export const DeleteFilter: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Step filter options' }),
    );
    await userEvent.click(
      await canvas.findByRole('menuitem', { name: 'Delete' }),
    );

    await expect(args.onFilterSettingsUpdate).toHaveBeenCalledTimes(1);
    await expect(args.onFilterSettingsUpdate).toHaveBeenCalledWith({
      stepFilters: [],
      stepFilterGroups: [],
    });
    await waitFor(() =>
      expect(canvas.queryByRole('menu')).not.toBeInTheDocument(),
    );
  },
};

export const AddNestedGroup: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Add filter rule' });

    await userEvent.click(trigger);
    await expect(
      (await canvas.findAllByRole('menuitem')).map((item) => item.textContent),
    ).toEqual(['Add rule', 'Add rule group']);
    await userEvent.click(
      canvas.getByRole('menuitem', { name: 'Add rule group' }),
    );

    await expect(args.onFilterSettingsUpdate).toHaveBeenCalledTimes(1);
    const [{ stepFilters = [], stepFilterGroups = [] }] = mocked(
      args.onFilterSettingsUpdate,
    ).mock.calls[0];

    await expect(stepFilterGroups).toHaveLength(2);
    await expect(stepFilters).toHaveLength(2);
    const [rootGroup, nestedGroup] = stepFilterGroups;
    const [existingFilter, nestedFilter] = stepFilters;

    await expect(rootGroup).toEqual(FILTER_GROUP);
    await expect(existingFilter).toEqual(FILTER);
    await expect(nestedGroup).toMatchObject({
      parentStepFilterGroupId: FILTER_GROUP.id,
      positionInStepFilterGroup: 4,
      logicalOperator: StepLogicalOperator.AND,
    });
    await expect(nestedFilter.positionInStepFilterGroup).toBe(1);
    await expect(nestedFilter.stepFilterGroupId).toBe(nestedGroup.id);
    await waitFor(() =>
      expect(canvas.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
