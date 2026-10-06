import { DashboardFilterDefaultValuesEffect } from '@/page-layout/dashboard-filters/components/DashboardFilterDefaultValuesEffect';
import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { render, waitFor } from '@testing-library/react';
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

const valuesAtom = dashboardFilterValuesComponentState.atomFamily({
  instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
});

describe('DashboardFilterDefaultValuesEffect', () => {
  it('replaces whatever is in memory with the slot defaults on mount', async () => {
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

    render(
      <PageLayoutTestWrapper
        store={store}
        layoutType={PageLayoutType.STANDALONE_PAGE}
      >
        <DashboardFilterDefaultValuesEffect
          slots={[DATE_SLOT_WITH_DEFAULT, OWNER_SLOT]}
        />
      </PageLayoutTestWrapper>,
    );

    await waitFor(() => {
      expect(store.get(valuesAtom)).toEqual({ date: TODAY_VALUE });
    });
  });
});
