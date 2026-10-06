import { BUILT_IN_DASHBOARD_FILTER_SLOT_IDS } from '@/page-layout/dashboard-filters/constants/BuiltInDashboardFilterSlotIds';
import { useDashboardFilterEditor } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterEditor';
import { isDashboardInEditModeComponentState } from '@/page-layout/states/isDashboardInEditModeComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { makeTab } from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { PAGE_LAYOUT_TEST_INSTANCE_ID } from '@/page-layout/widgets/graph/__tests__/GraphWidgetTestWrapper';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import {
  type DashboardFilterBindingsBySlotId,
  type DashboardFilterSlot,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutType, WidgetType } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const { DATE, OWNER } = BUILT_IN_DASHBOARD_FILTER_SLOT_IDS;

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const buildChartWidget = (
  id: string,
  dashboardFilterBindings?: DashboardFilterBindingsBySlotId,
) =>
  ({
    id,
    pageLayoutTabId: 'tab-1',
    title: id,
    type: WidgetType.GRAPH,
    objectMetadataId: companyObjectMetadataItem.id,
    configuration: {
      __typename: 'BarChartConfiguration',
      ...(isDefined(dashboardFilterBindings)
        ? { dashboardFilterBindings }
        : {}),
    },
  }) as unknown as PageLayoutWidget;

const FIELDS_WIDGET = {
  id: 'fields',
  type: WidgetType.FIELDS,
  configuration: { __typename: 'FieldsConfiguration' },
} as unknown as PageLayoutWidget;

const renderUseDashboardFilterEditor = (
  widgets: PageLayoutWidget[],
  dashboardFilters: DashboardFilterSlot[] | null,
) => {
  const MetadataWrapper = getJestMetadataAndApolloMocksWrapper({
    onInitializeJotaiStore: (store) => {
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
        {
          id: PAGE_LAYOUT_TEST_INSTANCE_ID,
          name: 'Dashboard',
          type: PageLayoutType.DASHBOARD,
          objectMetadataId: null,
          isFirstTabPinned: true,
          dashboardFilters,
          tabs: [makeTab('tab-1', widgets)],
        } as DraftPageLayout,
      );
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <I18nProvider i18n={i18n}>
      <MetadataWrapper>{children}</MetadataWrapper>
    </I18nProvider>
  );

  return renderHook(
    () => useDashboardFilterEditor(PAGE_LAYOUT_TEST_INSTANCE_ID),
    { wrapper },
  );
};

describe('useDashboardFilterEditor', () => {
  it('exposes the translated built-in slots and their resolved bindings while the dashboard has no custom slots', () => {
    const { result } = renderUseDashboardFilterEditor(
      [buildChartWidget('companies'), FIELDS_WIDGET],
      null,
    );

    expect(result.current.isUsingBuiltInFilters).toBe(true);
    expect(result.current.slots).toEqual([
      { id: DATE, label: 'Date', filterType: 'DATE_TIME' },
      { id: OWNER, label: 'Owner', filterType: 'RELATION' },
    ]);
    expect(result.current.bindingsByWidgetId.companies[DATE]).toEqual({
      fieldMetadataId: getMockFieldMetadataItemOrThrow({
        objectMetadataItem: companyObjectMetadataItem,
        fieldName: 'createdAt',
      }).id,
    });
    expect(result.current.chartWidgets.map((widget) => widget.id)).toEqual([
      'companies',
    ]);
  });

  it('exposes the draft slots, including unbound ones, once the dashboard has custom slots', () => {
    const boundSlot: DashboardFilterSlot = {
      id: 'bound',
      label: 'Bound',
      filterType: 'TEXT',
    };
    const unboundSlot: DashboardFilterSlot = {
      id: 'unbound',
      label: 'Unbound',
      filterType: 'TEXT',
    };

    const { result } = renderUseDashboardFilterEditor(
      [
        buildChartWidget('companies', {
          [boundSlot.id]: { fieldMetadataId: 'company-name' },
        }),
      ],
      [boundSlot, unboundSlot],
    );

    expect(result.current.isUsingBuiltInFilters).toBe(false);
    expect(result.current.slots).toEqual([boundSlot, unboundSlot]);
    expect(result.current.bindingsByWidgetId).toEqual({
      companies: { [boundSlot.id]: { fieldMetadataId: 'company-name' } },
    });
  });

  it('treats an empty custom list as custom, not as the built-ins', () => {
    const { result } = renderUseDashboardFilterEditor(
      [buildChartWidget('companies')],
      [],
    );

    expect(result.current.isUsingBuiltInFilters).toBe(false);
    expect(result.current.slots).toEqual([]);
  });
});
