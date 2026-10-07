import { DashboardFilterCrossFilterTabChangeEffect } from '@/page-layout/dashboard-filters/components/DashboardFilterCrossFilterTabChangeEffect';
import { dashboardFilterCrossFilterTabIdComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterCrossFilterTabIdComponentState';
import { dashboardFilterCrossFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterCrossFilterValuesComponentState';
import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { act, render } from '@testing-library/react';
import {
  type DashboardFilterValue,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { PageLayoutType } from '~/generated-metadata/graphql';

const NEW_STAGE_VALUE: DashboardFilterValue = {
  operand: ViewFilterOperand.IS,
  value: JSON.stringify(['NEW']),
};

const THIS_MONTH_VALUE: DashboardFilterValue = {
  operand: ViewFilterOperand.IS_RELATIVE,
  value: '{"direction":"THIS","amount":1,"unit":"MONTH"}',
};

const dashboardFilterValuesAtom =
  dashboardFilterValuesComponentState.atomFamily({
    instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
  });

const dashboardFilterCrossFilterValuesAtom =
  dashboardFilterCrossFilterValuesComponentState.atomFamily({
    instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
  });

const dashboardFilterCrossFilterTabIdAtom =
  dashboardFilterCrossFilterTabIdComponentState.atomFamily({
    instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
  });

const activeTabIdAtom = activeTabIdComponentState.atomFamily({
  instanceId: getTabListInstanceIdFromPageLayoutId(
    PAGE_LAYOUT_TEST_INSTANCE_ID,
  ),
});

// The cross-filter was applied from a chart on tab-1.
const renderEffect = ({ activeTabId }: { activeTabId: string | null }) => {
  resetJotaiStore();

  jotaiStore.set(activeTabIdAtom, activeTabId);
  jotaiStore.set(dashboardFilterCrossFilterTabIdAtom, 'tab-1');
  jotaiStore.set(dashboardFilterValuesAtom, {
    stage: NEW_STAGE_VALUE,
    date: THIS_MONTH_VALUE,
  });
  jotaiStore.set(dashboardFilterCrossFilterValuesAtom, {
    stage: NEW_STAGE_VALUE,
  });

  render(
    <PageLayoutTestWrapper
      store={jotaiStore}
      layoutType={PageLayoutType.DASHBOARD}
    >
      <DashboardFilterCrossFilterTabChangeEffect />
    </PageLayoutTestWrapper>,
  );
};

describe('DashboardFilterCrossFilterTabChangeEffect', () => {
  it('clears the cross-filtered values and their markers when the viewer changes tab', () => {
    renderEffect({ activeTabId: 'tab-1' });

    act(() => {
      jotaiStore.set(activeTabIdAtom, 'tab-2');
    });

    expect(jotaiStore.get(dashboardFilterValuesAtom)).toEqual({
      date: THIS_MONTH_VALUE,
    });
    expect(jotaiStore.get(dashboardFilterCrossFilterValuesAtom)).toEqual({});
    expect(jotaiStore.get(dashboardFilterCrossFilterTabIdAtom)).toBeNull();
  });

  it('does not clear anything while the tab list settles on the cross-filtered tab', () => {
    renderEffect({ activeTabId: null });

    act(() => {
      jotaiStore.set(activeTabIdAtom, 'tab-1');
    });

    expect(jotaiStore.get(dashboardFilterValuesAtom)).toEqual({
      stage: NEW_STAGE_VALUE,
      date: THIS_MONTH_VALUE,
    });
    expect(jotaiStore.get(dashboardFilterCrossFilterValuesAtom)).toEqual({
      stage: NEW_STAGE_VALUE,
    });
  });

  it('keeps a value the viewer changed after the chart set it', () => {
    renderEffect({ activeTabId: 'tab-1' });

    const customerStageValue: DashboardFilterValue = {
      operand: ViewFilterOperand.IS,
      value: JSON.stringify(['CUSTOMER']),
    };

    act(() => {
      jotaiStore.set(dashboardFilterValuesAtom, {
        stage: customerStageValue,
        date: THIS_MONTH_VALUE,
      });
      jotaiStore.set(activeTabIdAtom, 'tab-2');
    });

    expect(jotaiStore.get(dashboardFilterValuesAtom)).toEqual({
      stage: customerStageValue,
      date: THIS_MONTH_VALUE,
    });
    expect(jotaiStore.get(dashboardFilterCrossFilterValuesAtom)).toEqual({});
  });
});
