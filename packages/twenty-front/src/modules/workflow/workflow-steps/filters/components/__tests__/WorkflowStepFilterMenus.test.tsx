import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { StepLogicalOperator, type StepFilterGroup } from 'twenty-shared/types';

import { WorkflowStepFilterAddFilterRuleSelect } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterAddFilterRuleSelect';
import { WorkflowStepFilterGroupOptionsDropdown } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterGroupOptionsDropdown';
import { WorkflowStepFilterOptionsDropdown } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterOptionsDropdown';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';

const removeStepFilter = jest.fn();
const removeStepFilterGroup = jest.fn();
const addStepFilterToGroup = jest.fn();
const upsertStepFilterSettings = jest.fn();

jest.mock(
  '@/workflow/workflow-steps/filters/hooks/useRemoveStepFilter',
  () => ({
    useRemoveStepFilter: () => ({ removeStepFilter }),
  }),
);
jest.mock(
  '@/workflow/workflow-steps/filters/hooks/useRemoveStepFilterGroup',
  () => ({
    useRemoveStepFilterGroup: () => ({ removeStepFilterGroup }),
  }),
);
jest.mock(
  '@/workflow/workflow-steps/filters/hooks/useAddStepFilterToGroup',
  () => ({
    useAddStepFilterToGroup: () => ({ addStepFilterToGroup }),
  }),
);
jest.mock(
  '@/workflow/workflow-steps/filters/hooks/useUpsertStepFilterSettings',
  () => ({
    useUpsertStepFilterSettings: () => ({ upsertStepFilterSettings }),
  }),
);
jest.mock(
  '@/workflow/workflow-steps/filters/hooks/useChildStepFiltersAndChildStepFilterGroups',
  () => ({
    useChildStepFiltersAndChildStepFilterGroups: () => ({
      lastChildPosition: 3,
    }),
  }),
);

const filterGroup: StepFilterGroup = {
  id: 'group',
  logicalOperator: StepLogicalOperator.AND,
  positionInStepFilterGroup: 0,
};
const renderFilterMenus = (readonly = false) => {
  render(
    <I18nProvider i18n={i18n}>
      <Provider>
        <MemoryRouter>
          <WorkflowStepFilterContext.Provider
            value={{
              stepId: 'step',
              onFilterSettingsUpdate: jest.fn(),
              readonly,
            }}
          >
            <WorkflowStepFilterOptionsDropdown stepFilterId="filter" />
            <WorkflowStepFilterGroupOptionsDropdown stepFilterGroupId="group" />
            <WorkflowStepFilterAddFilterRuleSelect
              stepFilterGroup={filterGroup}
            />
          </WorkflowStepFilterContext.Provider>
        </MemoryRouter>
      </Provider>
    </I18nProvider>,
  );
  return userEvent.setup();
};

describe('Workflow step filter menus', () => {
  beforeEach(() => jest.clearAllMocks());

  it('prevents read-only filter and group actions from opening', async () => {
    const user = renderFilterMenus(true);
    const filterTrigger = screen.getByRole('button', {
      name: 'Step filter options',
    });
    const groupTrigger = screen.getByRole('button', {
      name: 'Step filter group options',
    });
    expect(filterTrigger).toBeDisabled();
    expect(groupTrigger).toBeDisabled();
    await user.click(filterTrigger);
    await user.click(groupTrigger);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(removeStepFilter).not.toHaveBeenCalled();
    expect(removeStepFilterGroup).not.toHaveBeenCalled();
  });

  it('deletes a filter and closes its menu', async () => {
    const user = renderFilterMenus();
    await user.click(
      screen.getByRole('button', { name: 'Step filter options' }),
    );
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }));
    expect(removeStepFilter).toHaveBeenCalledWith('filter');
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
  });

  it('creates a nested rule group in the original order and closes', async () => {
    const user = renderFilterMenus();
    const trigger = screen.getByRole('button', { name: 'Add filter rule' });
    await user.click(trigger);
    expect(
      (await screen.findAllByRole('menuitem')).map((item) => item.textContent),
    ).toEqual(['Add rule', 'Add rule group']);
    await user.click(screen.getByRole('menuitem', { name: 'Add rule group' }));
    expect(upsertStepFilterSettings).toHaveBeenCalledWith({
      stepFilterToUpsert: expect.objectContaining({
        positionInStepFilterGroup: 1,
        stepFilterGroupId: expect.any(String),
      }),
      stepFilterGroupToUpsert: expect.objectContaining({
        parentStepFilterGroupId: 'group',
        positionInStepFilterGroup: 4,
        logicalOperator: StepLogicalOperator.AND,
      }),
    });
    expect(addStepFilterToGroup).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});
