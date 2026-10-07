import { DashboardFilterDefaultValuesEffect } from '@/page-layout/dashboard-filters/components/DashboardFilterDefaultValuesEffect';
import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { hasInitializedDashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/hasInitializedDashboardFilterValuesComponentState';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { act, render, waitFor } from '@testing-library/react';
import { createStore } from 'jotai';
import {
  type DashboardFilterSlot,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { PageLayoutType } from '~/generated-metadata/graphql';

const TODAY_VALUE = { operand: ViewFilterOperand.IS_TODAY, value: '' };

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

const PERIOD_SLOT_WITH_DEFAULT: DashboardFilterSlot = {
  id: 'period',
  label: 'Period',
  filterType: 'DATE_TIME',
  defaultValue: { operand: ViewFilterOperand.IS_RELATIVE, value: 'PAST_7_DAY' },
};

const valuesAtom = dashboardFilterValuesComponentState.atomFamily({
  instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
});

const hasInitializedAtom =
  hasInitializedDashboardFilterValuesComponentState.atomFamily({
    instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
  });

const renderEffect = (
  store: ReturnType<typeof createStore>,
  slots: DashboardFilterSlot[],
) => (
  <PageLayoutTestWrapper
    store={store}
    layoutType={PageLayoutType.STANDALONE_PAGE}
  >
    <DashboardFilterDefaultValuesEffect slots={slots} />
  </PageLayoutTestWrapper>
);

describe('DashboardFilterDefaultValuesEffect', () => {
  it('replaces whatever is in memory with the slot defaults on mount and flags the values as initialized', async () => {
    const store = createStore();

    store.set(valuesAtom, {
      owner: {
        operand: ViewFilterOperand.IS,
        value: JSON.stringify({
          isCurrentWorkspaceMemberSelected: true,
          selectedRecordIds: [],
        }),
      },
    });

    const { unmount } = render(
      renderEffect(store, [DATE_SLOT_WITH_DEFAULT, OWNER_SLOT]),
    );

    await waitFor(() => {
      expect(store.get(valuesAtom)).toEqual({ date: TODAY_VALUE });
    });
    expect(store.get(hasInitializedAtom)).toBe(true);

    unmount();

    expect(store.get(hasInitializedAtom)).toBe(false);
  });

  it('seeds the default of a slot that appears later without touching slots already seen', async () => {
    const store = createStore();

    const { rerender } = render(renderEffect(store, [DATE_SLOT_WITH_DEFAULT]));

    await waitFor(() => {
      expect(store.get(valuesAtom)).toEqual({ date: TODAY_VALUE });
    });

    act(() => {
      store.set(valuesAtom, {});
    });

    rerender(
      renderEffect(store, [DATE_SLOT_WITH_DEFAULT, PERIOD_SLOT_WITH_DEFAULT]),
    );

    await waitFor(() => {
      expect(store.get(valuesAtom)).toEqual({
        period: PERIOD_SLOT_WITH_DEFAULT.defaultValue,
      });
    });
  });
});
