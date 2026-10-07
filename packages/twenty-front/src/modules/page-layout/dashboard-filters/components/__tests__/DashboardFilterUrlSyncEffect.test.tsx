import { DashboardFilterUrlSyncEffect } from '@/page-layout/dashboard-filters/components/DashboardFilterUrlSyncEffect';
import { BUILT_IN_DATE_DASHBOARD_FILTER_SLOT_ID } from '@/page-layout/dashboard-filters/constants/BuiltInDateDashboardFilterSlotId';
import { BUILT_IN_OWNER_DASHBOARD_FILTER_SLOT_ID } from '@/page-layout/dashboard-filters/constants/BuiltInOwnerDashboardFilterSlotId';
import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { act, render, waitFor } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type Location, MemoryRouter, useLocation } from 'react-router-dom';
import {
  type DashboardFilterSlot,
  type DashboardFilterValue,
  ViewFilterOperand,
} from 'twenty-shared/types';

const PAGE_LAYOUT_INSTANCE_ID = 'page-layout-id';

const SLOTS: DashboardFilterSlot[] = [
  {
    id: BUILT_IN_DATE_DASHBOARD_FILTER_SLOT_ID,
    label: 'Date',
    filterType: 'DATE_TIME',
  },
  {
    id: BUILT_IN_OWNER_DASHBOARD_FILTER_SLOT_ID,
    label: 'Owner',
    filterType: 'RELATION',
  },
];

const OWNER_ME_VALUE = JSON.stringify({
  isCurrentWorkspaceMemberSelected: true,
  selectedRecordIds: [],
});

const INITIAL_ENTRY = `/x?dashboardFilter[${BUILT_IN_DATE_DASHBOARD_FILTER_SLOT_ID}][operand]=IS_RELATIVE&dashboardFilter[${BUILT_IN_DATE_DASHBOARD_FILTER_SLOT_ID}][value]=THIS_1_MONTH&viewId=abc#tab-2`;

const INITIAL_ENTRY_WITH_TWO_SLOTS = `${INITIAL_ENTRY.replace('#tab-2', '')}&dashboardFilter[${BUILT_IN_OWNER_DASHBOARD_FILTER_SLOT_ID}][operand]=IS&dashboardFilter[${BUILT_IN_OWNER_DASHBOARD_FILTER_SLOT_ID}][value]=${encodeURIComponent(OWNER_ME_VALUE)}#tab-2`;

let currentLocation: Location | undefined;

const LocationSpyEffect = () => {
  currentLocation = useLocation();

  return null;
};

const dashboardFilterValuesAtom =
  dashboardFilterValuesComponentState.atomFamily({
    instanceId: PAGE_LAYOUT_INSTANCE_ID,
  });

const getDashboardFilterParam = (
  suffix: 'operand' | 'value',
  slotId: string = BUILT_IN_DATE_DASHBOARD_FILTER_SLOT_ID,
) =>
  new URLSearchParams(currentLocation?.search).get(
    `dashboardFilter[${slotId}][${suffix}]`,
  );

const renderEffect = ({
  ownsRouteLocation = true,
  initialEntry = INITIAL_ENTRY,
}: { ownsRouteLocation?: boolean; initialEntry?: string } = {}) => {
  const store = createStore();

  render(
    <JotaiProvider store={store}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <WorkspaceSurfaceContext.Provider
          value={{
            type: ownsRouteLocation ? 'main' : 'side-panel',
            instanceId: ownsRouteLocation ? 'main' : 'side-panel',
            ownsRouteLocation,
          }}
        >
          <PageLayoutComponentInstanceContext.Provider
            value={{ instanceId: PAGE_LAYOUT_INSTANCE_ID }}
          >
            <DashboardFilterUrlSyncEffect slots={SLOTS} />
            <LocationSpyEffect />
          </PageLayoutComponentInstanceContext.Provider>
        </WorkspaceSurfaceContext.Provider>
      </MemoryRouter>
    </JotaiProvider>,
  );

  return store;
};

const setDashboardFilterValues = (
  store: ReturnType<typeof createStore>,
  values: Record<string, DashboardFilterValue | undefined>,
) => {
  act(() => {
    store.set(dashboardFilterValuesAtom, values);
  });
};

describe('DashboardFilterUrlSyncEffect', () => {
  beforeEach(() => {
    currentLocation = undefined;
  });

  it('seeds the slot values from the URL on mount and keeps the tab hash', async () => {
    const store = renderEffect();

    await waitFor(() =>
      expect(store.get(dashboardFilterValuesAtom)).toEqual({
        [BUILT_IN_DATE_DASHBOARD_FILTER_SLOT_ID]: {
          operand: ViewFilterOperand.IS_RELATIVE,
          value: 'THIS_1_MONTH',
        },
      }),
    );

    expect(currentLocation?.hash).toBe('#tab-2');
    expect(getDashboardFilterParam('operand')).toBe('IS_RELATIVE');
    expect(getDashboardFilterParam('value')).toBe('THIS_1_MONTH');
  });

  it('writes a changed value to the URL without touching the hash or other params', async () => {
    const store = renderEffect();

    await waitFor(() =>
      expect(
        store.get(dashboardFilterValuesAtom)[
          BUILT_IN_DATE_DASHBOARD_FILTER_SLOT_ID
        ],
      ).toBeDefined(),
    );

    setDashboardFilterValues(store, {
      [BUILT_IN_DATE_DASHBOARD_FILTER_SLOT_ID]: {
        operand: ViewFilterOperand.IS_AFTER,
        value: '2026-01-01',
      },
    });

    await waitFor(() =>
      expect(getDashboardFilterParam('operand')).toBe('IS_AFTER'),
    );
    expect(getDashboardFilterParam('value')).toBe('2026-01-01');
    expect(currentLocation?.hash).toBe('#tab-2');
    expect(new URLSearchParams(currentLocation?.search).get('viewId')).toBe(
      'abc',
    );
  });

  it('removes the dashboard filter params when the value is cleared and keeps other params', async () => {
    const store = renderEffect();

    await waitFor(() =>
      expect(
        store.get(dashboardFilterValuesAtom)[
          BUILT_IN_DATE_DASHBOARD_FILTER_SLOT_ID
        ],
      ).toBeDefined(),
    );

    setDashboardFilterValues(store, {});

    await waitFor(() => expect(getDashboardFilterParam('operand')).toBeNull());
    expect(getDashboardFilterParam('value')).toBeNull();
    expect(
      Array.from(new URLSearchParams(currentLocation?.search).keys()),
    ).toEqual(['viewId']);
    expect(new URLSearchParams(currentLocation?.search).get('viewId')).toBe(
      'abc',
    );
    expect(currentLocation?.hash).toBe('#tab-2');
  });

  it('seeds two slots from the URL and keeps the other slot when one is cleared', async () => {
    const store = renderEffect({ initialEntry: INITIAL_ENTRY_WITH_TWO_SLOTS });

    await waitFor(() =>
      expect(store.get(dashboardFilterValuesAtom)).toEqual({
        [BUILT_IN_DATE_DASHBOARD_FILTER_SLOT_ID]: {
          operand: ViewFilterOperand.IS_RELATIVE,
          value: 'THIS_1_MONTH',
        },
        [BUILT_IN_OWNER_DASHBOARD_FILTER_SLOT_ID]: {
          operand: ViewFilterOperand.IS,
          value: OWNER_ME_VALUE,
        },
      }),
    );

    setDashboardFilterValues(store, {
      [BUILT_IN_OWNER_DASHBOARD_FILTER_SLOT_ID]: {
        operand: ViewFilterOperand.IS,
        value: OWNER_ME_VALUE,
      },
    });

    await waitFor(() => expect(getDashboardFilterParam('operand')).toBeNull());
    expect(
      getDashboardFilterParam(
        'operand',
        BUILT_IN_OWNER_DASHBOARD_FILTER_SLOT_ID,
      ),
    ).toBe('IS');
    expect(
      getDashboardFilterParam('value', BUILT_IN_OWNER_DASHBOARD_FILTER_SLOT_ID),
    ).toBe(OWNER_ME_VALUE);
    expect(currentLocation?.hash).toBe('#tab-2');
  });

  it('neither reads nor writes the URL from a surface that does not own the route location', async () => {
    const store = renderEffect({ ownsRouteLocation: false });

    await waitFor(() => expect(currentLocation).toBeDefined());

    expect(store.get(dashboardFilterValuesAtom)).toEqual({});

    setDashboardFilterValues(store, {
      [BUILT_IN_DATE_DASHBOARD_FILTER_SLOT_ID]: {
        operand: ViewFilterOperand.IS_AFTER,
        value: '2026-01-01',
      },
    });

    await waitFor(() =>
      expect(getDashboardFilterParam('operand')).toBe('IS_RELATIVE'),
    );
    expect(getDashboardFilterParam('value')).toBe('THIS_1_MONTH');
  });
});
