import { useMissingRequiredDashboardFilterSlot } from '@/page-layout/dashboard-filters/hooks/useMissingRequiredDashboardFilterSlot';
import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { buildChartWidget } from '@/page-layout/dashboard-filters/testing/dashboardFilterTestFixtures';
import { type DashboardFilterValues } from '@/page-layout/dashboard-filters/types/DashboardFilterValues';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { makeTab } from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import {
  GraphWidgetTestWrapper,
  PAGE_LAYOUT_TEST_INSTANCE_ID,
} from '@/page-layout/widgets/graph/__tests__/GraphWidgetTestWrapper';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { renderHook } from '@testing-library/react';
import { type Store } from 'jotai/vanilla/store';
import { type ReactNode } from 'react';
import {
  type DashboardFilterSlot,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { PageLayoutType } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const BOUND_CHART_WIDGET_ID = 'bound-chart';
const UNBOUND_CHART_WIDGET_ID = 'unbound-chart';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const createdAtFieldMetadataItem = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'createdAt',
});

const REQUIRED_DATE_SLOT: DashboardFilterSlot = {
  id: 'date',
  label: 'Period',
  filterType: 'DATE_TIME',
  isRequired: true,
};

const OPTIONAL_DATE_SLOT: DashboardFilterSlot = {
  ...REQUIRED_DATE_SLOT,
  isRequired: false,
};

const WIDGETS = [
  buildChartWidget({
    id: BOUND_CHART_WIDGET_ID,
    objectMetadataId: companyObjectMetadataItem.id,
    dashboardFilterBindings: {
      [REQUIRED_DATE_SLOT.id]: {
        fieldMetadataId: createdAtFieldMetadataItem.id,
      },
    },
  }),
  buildChartWidget({
    id: UNBOUND_CHART_WIDGET_ID,
    objectMetadataId: companyObjectMetadataItem.id,
    dashboardFilterBindings: { [REQUIRED_DATE_SLOT.id]: null },
  }),
];

const renderUseMissingRequiredDashboardFilterSlot = ({
  widgetId,
  slots = [REQUIRED_DATE_SLOT],
  dashboardFilterValues = {},
}: {
  widgetId: string;
  slots?: DashboardFilterSlot[];
  dashboardFilterValues?: DashboardFilterValues;
}) => {
  const onInitializeJotaiStore = (store: Store) => {
    store.set(
      pageLayoutPersistedComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      {
        id: PAGE_LAYOUT_TEST_INSTANCE_ID,
        name: 'Dashboard',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: null,
        tabs: [makeTab('tab-1', WIDGETS)],
        dashboardFilters: slots,
      } as unknown as PageLayout,
    );

    store.set(
      dashboardFilterValuesComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      dashboardFilterValues,
    );
  };

  const MetadataWrapper = getJestMetadataAndApolloMocksWrapper({
    onInitializeJotaiStore,
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <I18nProvider i18n={i18n}>
      <MetadataWrapper>
        <GraphWidgetTestWrapper instanceId={widgetId}>
          {children}
        </GraphWidgetTestWrapper>
      </MetadataWrapper>
    </I18nProvider>
  );

  return renderHook(() => useMissingRequiredDashboardFilterSlot(), {
    wrapper,
  });
};

describe('useMissingRequiredDashboardFilterSlot', () => {
  it('returns the required slot the current chart binds while it has no value', () => {
    const { result } = renderUseMissingRequiredDashboardFilterSlot({
      widgetId: BOUND_CHART_WIDGET_ID,
    });

    expect(result.current).toEqual(REQUIRED_DATE_SLOT);
  });

  it('returns undefined once the required slot has a valid value', () => {
    const { result } = renderUseMissingRequiredDashboardFilterSlot({
      widgetId: BOUND_CHART_WIDGET_ID,
      dashboardFilterValues: {
        [REQUIRED_DATE_SLOT.id]: {
          operand: ViewFilterOperand.IS_TODAY,
          value: '',
        },
      },
    });

    expect(result.current).toBeUndefined();
  });

  it('returns undefined for a chart that does not bind the required slot', () => {
    const { result } = renderUseMissingRequiredDashboardFilterSlot({
      widgetId: UNBOUND_CHART_WIDGET_ID,
    });

    expect(result.current).toBeUndefined();
  });

  it('returns undefined when the slot is optional', () => {
    const { result } = renderUseMissingRequiredDashboardFilterSlot({
      widgetId: BOUND_CHART_WIDGET_ID,
      slots: [OPTIONAL_DATE_SLOT],
    });

    expect(result.current).toBeUndefined();
  });
});
