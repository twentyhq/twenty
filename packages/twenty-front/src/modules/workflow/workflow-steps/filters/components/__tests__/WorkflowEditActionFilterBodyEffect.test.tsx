import { render } from '@testing-library/react';
import { act } from 'react';
import {
  type StepFilter,
  type StepFilterGroup,
  StepLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { convertViewFilterOperandToCoreOperand } from 'twenty-shared/utils';

import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { WorkflowEditActionFilterBodyEffect } from '@/workflow/workflow-steps/filters/components/WorkflowEditActionFilterBodyEffect';
import { StepFilterGroupsComponentInstanceContext } from '@/workflow/workflow-steps/filters/states/context/StepFilterGroupsComponentInstanceContext';
import { StepFiltersComponentInstanceContext } from '@/workflow/workflow-steps/filters/states/context/StepFiltersComponentInstanceContext';
import { currentStepFilterGroupsComponentState } from '@/workflow/workflow-steps/filters/states/currentStepFilterGroupsComponentState';
import { currentStepFiltersComponentState } from '@/workflow/workflow-steps/filters/states/currentStepFiltersComponentState';
import { type FilterSettingsWithPotentiallyDeprecatedOperand } from '@/workflow/workflow-steps/filters/types/FilterSettings';

const makeStepFilterGroup = (id: string): StepFilterGroup => ({
  id,
  logicalOperator: StepLogicalOperator.AND,
});

const makeStepFilter = (id: string, stepFilterGroupId: string): StepFilter => ({
  id,
  type: 'unknown',
  stepOutputKey: '',
  operand: ViewFilterOperand.IS,
  value: '',
  stepFilterGroupId,
  positionInStepFilterGroup: 0,
});

// `defaultValue` filters are stored with potentially deprecated operands and are
// normalized to core operands when synced into the atoms.
const toExpectedSyncedFilter = (filter: StepFilter) => ({
  ...filter,
  operand: convertViewFilterOperandToCoreOperand(filter.operand),
});

type Captured = {
  filters: StepFilter[];
  filterGroups: StepFilterGroup[];
  setFilters: (value: StepFilter[]) => void;
  setFilterGroups: (value: StepFilterGroup[]) => void;
};

const renderBodyEffect = (
  instanceId: string,
  defaultValue?: FilterSettingsWithPotentiallyDeprecatedOperand,
) => {
  const captured: Captured = {} as Captured;

  const Probe = () => {
    captured.filters = useAtomComponentStateValue(
      currentStepFiltersComponentState,
    );
    captured.filterGroups = useAtomComponentStateValue(
      currentStepFilterGroupsComponentState,
    );
    captured.setFilters = useSetAtomComponentState(
      currentStepFiltersComponentState,
    );
    captured.setFilterGroups = useSetAtomComponentState(
      currentStepFilterGroupsComponentState,
    );

    return null;
  };

  const Harness = ({
    value,
  }: {
    value?: FilterSettingsWithPotentiallyDeprecatedOperand;
  }) => (
    <StepFiltersComponentInstanceContext.Provider value={{ instanceId }}>
      <StepFilterGroupsComponentInstanceContext.Provider value={{ instanceId }}>
        <WorkflowEditActionFilterBodyEffect defaultValue={value} />
        <Probe />
      </StepFilterGroupsComponentInstanceContext.Provider>
    </StepFiltersComponentInstanceContext.Provider>
  );

  const utils = render(<Harness value={defaultValue} />);

  return {
    captured,
    rerender: (value?: FilterSettingsWithPotentiallyDeprecatedOperand) =>
      utils.rerender(<Harness value={value} />),
  };
};

describe('WorkflowEditActionFilterBodyEffect', () => {
  it('seeds the local atoms from defaultValue on mount', () => {
    const stepFilterGroup = makeStepFilterGroup('group-1');
    const stepFilter = makeStepFilter('filter-1', 'group-1');

    const { captured } = renderBodyEffect('seed', {
      stepFilterGroups: [stepFilterGroup],
      stepFilters: [stepFilter],
    });

    expect(captured.filterGroups).toEqual([stepFilterGroup]);
    expect(captured.filters).toEqual([toExpectedSyncedFilter(stepFilter)]);
  });

  // Regression test for the "Conditions" flash: when the user adds a condition,
  // the local atoms are updated synchronously while the persisted value (passed
  // as defaultValue) only catches up after an async save. The effect must not
  // overwrite the local edit during that window.
  it('does not overwrite a local edit while defaultValue is still stale', () => {
    const { captured, rerender } = renderBodyEffect('no-clobber', {
      stepFilterGroups: [],
      stepFilters: [],
    });

    expect(captured.filters).toEqual([]);
    expect(captured.filterGroups).toEqual([]);

    const editedGroup = makeStepFilterGroup('edited-group');
    const editedFilter = makeStepFilter('edited-filter', 'edited-group');

    act(() => {
      captured.setFilterGroups([editedGroup]);
      captured.setFilters([editedFilter]);
    });

    expect(captured.filters).toEqual([editedFilter]);
    expect(captured.filterGroups).toEqual([editedGroup]);

    // The save has not landed yet, so defaultValue is still the stale empty value.
    act(() => {
      rerender({ stepFilterGroups: [], stepFilters: [] });
    });

    expect(captured.filters).toEqual([editedFilter]);
    expect(captured.filterGroups).toEqual([editedGroup]);
  });

  it('resyncs the atoms when defaultValue actually changes', () => {
    const { captured, rerender } = renderBodyEffect('resync', {
      stepFilterGroups: [],
      stepFilters: [],
    });

    const nextGroup = makeStepFilterGroup('group-2');
    const nextFilter = makeStepFilter('filter-2', 'group-2');

    act(() => {
      rerender({
        stepFilterGroups: [nextGroup],
        stepFilters: [nextFilter],
      });
    });

    expect(captured.filterGroups).toEqual([nextGroup]);
    expect(captured.filters).toEqual([toExpectedSyncedFilter(nextFilter)]);
  });
});
