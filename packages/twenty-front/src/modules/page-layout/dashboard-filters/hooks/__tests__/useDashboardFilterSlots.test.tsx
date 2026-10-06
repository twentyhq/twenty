import { BUILT_IN_DASHBOARD_FILTER_SLOT_IDS } from '@/page-layout/dashboard-filters/constants/BuiltInDashboardFilterSlotIds';
import { useDashboardFilterSlots } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterSlots';
import { isDashboardInEditModeComponentState } from '@/page-layout/states/isDashboardInEditModeComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { makeTab } from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import {
  GraphWidgetTestWrapper,
  PAGE_LAYOUT_TEST_INSTANCE_ID,
} from '@/page-layout/widgets/graph/__tests__/GraphWidgetTestWrapper';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, renderHook } from '@testing-library/react';
import { type Store } from 'jotai/vanilla/store';
import { type ReactNode } from 'react';
import {
  type DashboardFilterBindingsBySlotId,
  type DashboardFilterSlot,
} from 'twenty-shared/types';
import { PageLayoutType, WidgetType } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { isDefined } from 'twenty-shared/utils';

const { DATE, OWNER } = BUILT_IN_DASHBOARD_FILTER_SLOT_IDS;

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');

const buildChartWidget = (
  id: string,
  objectMetadataId: string,
  dashboardFilterBindings?: DashboardFilterBindingsBySlotId,
) =>
  ({
    id,
    pageLayoutTabId: 'tab-1',
    title: id,
    type: WidgetType.GRAPH,
    objectMetadataId,
    configuration: {
      __typename: 'BarChartConfiguration',
      ...(isDefined(dashboardFilterBindings)
        ? { dashboardFilterBindings }
        : {}),
    },
  }) as unknown as PageLayoutWidget;

const COMPANY_CHART = buildChartWidget(
  'companies',
  companyObjectMetadataItem.id,
);
const PERSON_CHART = buildChartWidget('people', personObjectMetadataItem.id);

const buildPageLayout = (
  widgets: PageLayoutWidget[],
  dashboardFilters: DashboardFilterSlot[] | null = null,
) =>
  ({
    id: PAGE_LAYOUT_TEST_INSTANCE_ID,
    name: 'Dashboard',
    type: PageLayoutType.DASHBOARD,
    objectMetadataId: null,
    dashboardFilters,
    tabs: [makeTab('tab-1', widgets)],
  }) as unknown as PageLayout;

const renderUseDashboardFilterSlots = (
  persistedWidgets: PageLayoutWidget[],
  dashboardFilters: DashboardFilterSlot[] | null = null,
) => {
  let store: Store | undefined;

  const MetadataWrapper = getJestMetadataAndApolloMocksWrapper({
    onInitializeJotaiStore: (initializedStore) => {
      store = initializedStore;

      initializedStore.set(
        pageLayoutPersistedComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        buildPageLayout(persistedWidgets, dashboardFilters),
      );
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <I18nProvider i18n={i18n}>
      <MetadataWrapper>
        <GraphWidgetTestWrapper>{children}</GraphWidgetTestWrapper>
      </MetadataWrapper>
    </I18nProvider>
  );

  const renderHookResult = renderHook(() => useDashboardFilterSlots(), {
    wrapper,
  });

  if (store === undefined) {
    throw new Error('Jotai store was not initialized');
  }

  return { ...renderHookResult, store };
};

describe('useDashboardFilterSlots', () => {
  it('exposes the built-in slots some chart binds, with translated labels', () => {
    const { result } = renderUseDashboardFilterSlots([
      COMPANY_CHART,
      PERSON_CHART,
    ]);

    expect(result.current.slots).toEqual([
      { id: DATE, label: 'Date', filterType: 'DATE_TIME' },
      { id: OWNER, label: 'Owner', filterType: 'RELATION' },
    ]);
    expect(result.current.bindingsByWidgetId[COMPANY_CHART.id]).toEqual({
      [DATE]: {
        fieldMetadataId: getMockFieldMetadataItemOrThrow({
          objectMetadataItem: companyObjectMetadataItem,
          fieldName: 'createdAt',
        }).id,
      },
      [OWNER]: {
        fieldMetadataId: getMockFieldMetadataItemOrThrow({
          objectMetadataItem: companyObjectMetadataItem,
          fieldName: 'accountOwner',
        }).id,
      },
    });
  });

  it('keeps the same slots across renders while nothing changed', () => {
    const { result, rerender } = renderUseDashboardFilterSlots([COMPANY_CHART]);

    const firstSlots = result.current.slots;
    const firstBindings = result.current.bindingsByWidgetId;

    rerender();

    expect(result.current.slots).toBe(firstSlots);
    expect(result.current.bindingsByWidgetId).toBe(firstBindings);
  });

  it('uses the persisted slots and chart bindings once the layout has its own filters', () => {
    const stageSlot: DashboardFilterSlot = {
      id: 'stage',
      label: 'Pipeline stage',
      filterType: 'SELECT',
    };
    const cityCreatedAtSlot: DashboardFilterSlot = {
      id: 'created',
      label: 'Created',
      filterType: 'DATE_TIME',
    };

    const { result } = renderUseDashboardFilterSlots(
      [
        buildChartWidget('bound', companyObjectMetadataItem.id, {
          stage: { fieldMetadataId: 'company-stage-field' },
          created: { fieldMetadataId: 'company-created-at-field' },
        }),
        buildChartWidget('opted-out', personObjectMetadataItem.id, {
          stage: null,
          created: { fieldMetadataId: 'person-created-at-field' },
        }),
        buildChartWidget('legacy', personObjectMetadataItem.id),
      ],
      [stageSlot, cityCreatedAtSlot],
    );

    expect(result.current.slots).toEqual([stageSlot, cityCreatedAtSlot]);
    expect(result.current.bindingsByWidgetId).toEqual({
      bound: {
        stage: { fieldMetadataId: 'company-stage-field' },
        created: { fieldMetadataId: 'company-created-at-field' },
      },
      'opted-out': {
        stage: null,
        created: { fieldMetadataId: 'person-created-at-field' },
      },
      legacy: { stage: null, created: null },
    });
  });

  it('hides the built-ins once the layout persists an empty slot list', () => {
    const { result } = renderUseDashboardFilterSlots([COMPANY_CHART], []);

    expect(result.current.slots).toEqual([]);
    expect(result.current.bindingsByWidgetId).toEqual({
      [COMPANY_CHART.id]: {},
    });
  });

  it('falls back to the built-ins while the layout has no persisted filters', () => {
    const { result } = renderUseDashboardFilterSlots([COMPANY_CHART], null);

    expect(result.current.slots.map((slot) => slot.id)).toEqual([DATE, OWNER]);
  });

  it('follows the draft while the dashboard is edited', () => {
    const { result, store } = renderUseDashboardFilterSlots([
      COMPANY_CHART,
      PERSON_CHART,
    ]);

    expect(result.current.slots.map((slot) => slot.id)).toEqual([DATE, OWNER]);

    act(() => {
      store.set(
        isDashboardInEditModeComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        true,
      );
      store.set(
        pageLayoutDraftComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        buildPageLayout([PERSON_CHART]) as DraftPageLayout,
      );
    });

    expect(result.current.slots.map((slot) => slot.id)).toEqual([DATE]);
    expect(result.current.bindingsByWidgetId).toEqual({
      [PERSON_CHART.id]: {
        [DATE]: {
          fieldMetadataId: getMockFieldMetadataItemOrThrow({
            objectMetadataItem: personObjectMetadataItem,
            fieldName: 'createdAt',
          }).id,
        },
      },
    });
  });
});
