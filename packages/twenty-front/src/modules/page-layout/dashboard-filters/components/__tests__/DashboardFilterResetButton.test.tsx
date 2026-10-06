import { DashboardFilterResetButton } from '@/page-layout/dashboard-filters/components/DashboardFilterResetButton';
import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { type DashboardFilterValues } from '@/page-layout/dashboard-filters/types/DashboardFilterValues';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore } from 'jotai';
import {
  type DashboardFilterSlot,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { PageLayoutType } from '~/generated-metadata/graphql';

const TODAY_VALUE = { operand: ViewFilterOperand.IS_TODAY, value: '' };
const PAST_VALUE = { operand: ViewFilterOperand.IS_IN_PAST, value: '' };

const DATE_SLOT_WITH_DEFAULT: DashboardFilterSlot = {
  id: 'date',
  label: 'Date',
  filterType: 'DATE_TIME',
  defaultValue: TODAY_VALUE,
};

const OWNER_SLOT: DashboardFilterSlot = {
  id: 'owner',
  label: 'Owner',
  filterType: 'RELATION',
};

const SLOTS = [DATE_SLOT_WITH_DEFAULT, OWNER_SLOT];

const valuesAtom = dashboardFilterValuesComponentState.atomFamily({
  instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
});

const renderResetButton = (values: DashboardFilterValues) => {
  const store = createStore();

  store.set(valuesAtom, values);

  render(
    <PageLayoutTestWrapper
      store={store}
      layoutType={PageLayoutType.STANDALONE_PAGE}
    >
      <DashboardFilterResetButton slots={SLOTS} />
    </PageLayoutTestWrapper>,
  );

  return { store };
};

describe('DashboardFilterResetButton', () => {
  it('is hidden while every slot sits at its default', () => {
    renderResetButton({ date: TODAY_VALUE });

    expect(
      screen.queryByRole('button', { name: 'Reset' }),
    ).not.toBeInTheDocument();
  });

  it('puts every slot back to its default in one click', async () => {
    const { store } = renderResetButton({
      date: PAST_VALUE,
      owner: {
        operand: ViewFilterOperand.IS,
        value: JSON.stringify({
          isCurrentWorkspaceMemberSelected: true,
          selectedRecordIds: [],
        }),
      },
    });

    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));

    expect(store.get(valuesAtom)).toEqual({ date: TODAY_VALUE });
    expect(
      screen.queryByRole('button', { name: 'Reset' }),
    ).not.toBeInTheDocument();
  });

  it('shows up when a slot with a default has been cleared', () => {
    renderResetButton({});

    expect(screen.getByRole('button', { name: 'Reset' })).toBeVisible();
  });
});
