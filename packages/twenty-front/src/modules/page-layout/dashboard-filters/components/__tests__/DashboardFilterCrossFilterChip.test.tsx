import { DashboardFilterBar } from '@/page-layout/dashboard-filters/components/DashboardFilterBar';
import { dashboardFilterCrossFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterCrossFilterValuesComponentState';
import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { applyDashboardFilterValuesToSearchParams } from '@/page-layout/dashboard-filters/utils/applyDashboardFilterValuesToSearchParams';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { makeTab } from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { buildDefaultBarChartConfiguration } from '@/page-layout/utils/buildDefaultBarChartConfiguration';
import { buildDraftPageLayoutWidget } from '@/page-layout/utils/buildDraftPageLayoutWidget';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import {
  type DashboardFilterSlot,
  type DashboardFilterValue,
  ViewFilterOperand,
} from 'twenty-shared/types';
import {
  getDashboardFilterRecordFilterId,
  isDefined,
  jsonRelationFilterValueSchema,
} from 'twenty-shared/utils';
import { ThemeProvider } from 'twenty-ui/theme';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { JestObjectMetadataItemSetter } from '~/testing/jest/JestObjectMetadataItemSetter';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

// The record picker and the chip label both query companies; the mock stands in for Apollo.
const mockUseRecordsForSelect = jest.fn();

jest.mock('@/object-record/select/hooks/useRecordsForSelect', () => ({
  useRecordsForSelect: (...args: unknown[]) => mockUseRecordsForSelect(...args),
}));

const ACME_COMPANY_ID = '20202020-0000-4000-8000-00000000ac3e';
const GLOBEX_COMPANY_ID = '20202020-0000-4000-8000-00000000610b';

const opportunityObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('opportunity');

const companyField = opportunityObjectMetadataItem.fields.find(
  (field) => field.name === 'company',
);

if (!isDefined(companyField)) {
  throw new Error('Expected the opportunity mock to have a company field');
}

const COMPANY_SLOT: DashboardFilterSlot = {
  id: 'company-slot',
  label: 'Company',
  filterType: 'RELATION',
  defaultOperand: ViewFilterOperand.IS,
};

// The value a click on the "Acme" bucket of an Opportunities-by-Company chart writes.
const ACME_CROSS_FILTER_VALUE: DashboardFilterValue = {
  operand: ViewFilterOperand.IS,
  value: JSON.stringify({
    isCurrentWorkspaceMemberSelected: false,
    selectedRecordIds: [ACME_COMPANY_ID],
  }),
};

const opportunityChartWidget = buildDraftPageLayoutWidget({
  id: 'opportunity-widget',
  pageLayoutTabId: 'tab-1',
  title: 'Opportunities by company',
  type: WidgetType.GRAPH,
  configuration: {
    ...buildDefaultBarChartConfiguration({}),
    primaryAxisGroupByFieldMetadataId: companyField.id,
    dashboardFilterBindings: {
      [COMPANY_SLOT.id]: { fieldMetadataId: companyField.id },
    },
  },
  position: {
    layoutMode: PageLayoutTabLayoutMode.GRID,
    row: 0,
    column: 0,
    rowSpan: 2,
    columnSpan: 2,
  },
  objectMetadataId: opportunityObjectMetadataItem.id,
});

const dashboardFilterValuesAtom =
  dashboardFilterValuesComponentState.atomFamily({
    instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
  });

const dashboardFilterCrossFilterValuesAtom =
  dashboardFilterCrossFilterValuesComponentState.atomFamily({
    instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
  });

// The URL is authoritative on first mount, so the cross-filtered value is seeded there, with its marker in the store.
const renderCrossFilteredBar = async () => {
  resetJotaiStore();

  jotaiStore.set(
    pageLayoutPersistedComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    }),
    {
      id: PAGE_LAYOUT_TEST_INSTANCE_ID,
      name: 'Dashboard',
      type: PageLayoutType.DASHBOARD,
      objectMetadataId: null,
      dashboardFilters: [COMPANY_SLOT],
      tabs: [
        makeTab(
          'tab-1',
          [opportunityChartWidget],
          0,
          PageLayoutTabLayoutMode.GRID,
        ),
      ],
    } as PageLayout,
  );

  jotaiStore.set(dashboardFilterCrossFilterValuesAtom, {
    [COMPANY_SLOT.id]: ACME_CROSS_FILTER_VALUE,
  });

  const initialSearchParams = applyDashboardFilterValuesToSearchParams({
    searchParams: new URLSearchParams(),
    dashboardFilterValues: { [COMPANY_SLOT.id]: ACME_CROSS_FILTER_VALUE },
  });

  render(
    <I18nProvider i18n={i18n}>
      <ThemeProvider colorScheme="light">
        <JotaiProvider store={jotaiStore}>
          <MemoryRouter
            initialEntries={[`/?${initialSearchParams.toString()}`]}
          >
            <JestObjectMetadataItemSetter>
              <PageLayoutTestWrapper
                store={jotaiStore}
                layoutType={PageLayoutType.DASHBOARD}
              >
                <DashboardFilterBar />
                <div data-testid="metadata-loaded" />
              </PageLayoutTestWrapper>
            </JestObjectMetadataItemSetter>
          </MemoryRouter>
        </JotaiProvider>
      </ThemeProvider>
    </I18nProvider>,
  );

  await screen.findByTestId('metadata-loaded');

  await waitFor(() =>
    expect(jotaiStore.get(dashboardFilterValuesAtom)[COMPANY_SLOT.id]).toEqual(
      ACME_CROSS_FILTER_VALUE,
    ),
  );
};

const getCompanyChipRemoveButton = () =>
  screen.getByTestId(
    `remove-icon-${getDashboardFilterRecordFilterId(COMPANY_SLOT.id)}`,
  );

describe('DashboardFilter chip holding a cross-filter', () => {
  beforeEach(() => {
    const acmeRecord = { id: ACME_COMPANY_ID, name: 'Acme', isSelected: false };
    const globexRecord = {
      id: GLOBEX_COMPANY_ID,
      name: 'Globex',
      isSelected: false,
    };

    mockUseRecordsForSelect.mockImplementation(
      ({ selectedIds }: { selectedIds: string[] }) => ({
        selectedRecords: [acmeRecord, globexRecord]
          .filter((record) => selectedIds.includes(record.id))
          .map((record) => ({ ...record, isSelected: true })),
        filteredSelectedRecords: [],
        recordsToSelect: [acmeRecord, globexRecord],
        loading: false,
      }),
    );
  });

  it('labels the chip with the record the chart bucket selected', async () => {
    await renderCrossFilteredBar();

    await waitFor(() =>
      expect(getCompanyChipRemoveButton().parentElement?.textContent).toContain(
        'Acme',
      ),
    );
  });

  it('clears both the value and the cross-filter marker from the remove action', async () => {
    await renderCrossFilteredBar();

    const user = userEvent.setup();

    await user.click(getCompanyChipRemoveButton());

    await waitFor(() =>
      expect(
        jotaiStore.get(dashboardFilterValuesAtom)[COMPANY_SLOT.id],
      ).toBeUndefined(),
    );
    expect(jotaiStore.get(dashboardFilterCrossFilterValuesAtom)).toEqual({});
  });

  it('turns the value into the viewer own pick once it is edited through the chip', async () => {
    await renderCrossFilteredBar();

    const user = userEvent.setup();

    await user.click(screen.getByText('Company'));
    await user.click(await screen.findByRole('option', { name: 'Globex' }));

    await waitFor(() => {
      const companyValue = jotaiStore.get(dashboardFilterValuesAtom)[
        COMPANY_SLOT.id
      ];

      expect(
        jsonRelationFilterValueSchema.parse(companyValue?.value ?? '')
          .selectedRecordIds,
      ).toEqual(expect.arrayContaining([ACME_COMPANY_ID, GLOBEX_COMPANY_ID]));
    });
    expect(jotaiStore.get(dashboardFilterCrossFilterValuesAtom)).toEqual({});
  });
});
