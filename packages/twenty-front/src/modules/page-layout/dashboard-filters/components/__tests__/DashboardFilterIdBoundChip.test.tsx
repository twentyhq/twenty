import { DashboardFilterBar } from '@/page-layout/dashboard-filters/components/DashboardFilterBar';
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

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const companyIdField = companyObjectMetadataItem.fields.find(
  (field) => field.name === 'id',
);

if (!isDefined(companyIdField)) {
  throw new Error('Expected the company mock to have an id field');
}

const COMPANY_SLOT: DashboardFilterSlot = {
  id: 'company-slot',
  label: 'Company',
  filterType: 'RELATION',
  defaultOperand: ViewFilterOperand.IS,
};

const companyChartWidget = buildDraftPageLayoutWidget({
  id: 'company-widget',
  pageLayoutTabId: 'tab-1',
  title: 'Companies',
  type: WidgetType.GRAPH,
  configuration: {
    ...buildDefaultBarChartConfiguration({}),
    dashboardFilterBindings: {
      [COMPANY_SLOT.id]: { fieldMetadataId: companyIdField.id },
    },
  },
  position: {
    layoutMode: PageLayoutTabLayoutMode.GRID,
    row: 0,
    column: 0,
    rowSpan: 2,
    columnSpan: 2,
  },
  objectMetadataId: companyObjectMetadataItem.id,
});

const dashboardFilterValuesAtom =
  dashboardFilterValuesComponentState.atomFamily({
    instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
  });

// The URL is authoritative on first mount, so a value "arriving from the URL" has to be in the router location.
const renderDashboardFilterBar = async ({
  urlDashboardFilterValues = {},
}: {
  urlDashboardFilterValues?: Record<string, DashboardFilterValue | undefined>;
} = {}) => {
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
        makeTab('tab-1', [companyChartWidget], 0, PageLayoutTabLayoutMode.GRID),
      ],
    } as PageLayout,
  );

  const initialSearchParams = applyDashboardFilterValuesToSearchParams({
    searchParams: new URLSearchParams(),
    dashboardFilterValues: urlDashboardFilterValues,
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
};

// The open dropdown header repeats the slot label, so the chip is located through its remove button.
const getCompanyChipText = () =>
  screen.getByTestId(
    `remove-icon-${getDashboardFilterRecordFilterId(COMPANY_SLOT.id)}`,
  ).parentElement?.textContent ?? '';

describe('DashboardFilter chip bound through the chart object own id', () => {
  beforeEach(() => {
    const acmeRecord = { id: ACME_COMPANY_ID, name: 'Acme', isSelected: false };

    mockUseRecordsForSelect.mockImplementation(
      ({ selectedIds }: { selectedIds: string[] }) => ({
        selectedRecords: selectedIds.includes(ACME_COMPANY_ID)
          ? [{ ...acmeRecord, isSelected: true }]
          : [],
        filteredSelectedRecords: [],
        recordsToSelect: [acmeRecord],
        loading: false,
      }),
    );
  });

  it('opens a record picker of the derived target object instead of a text input', async () => {
    await renderDashboardFilterBar();

    const user = userEvent.setup();

    await user.click(screen.getByText('Company'));

    expect(
      await screen.findByRole('option', { name: 'Acme' }),
    ).toBeInTheDocument();
    expect(mockUseRecordsForSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        objectNameSingular: companyObjectMetadataItem.nameSingular,
      }),
    );
  });

  it('writes the relation value when a record is picked and labels the chip with it', async () => {
    await renderDashboardFilterBar();

    const user = userEvent.setup();

    await user.click(screen.getByText('Company'));
    await user.click(await screen.findByRole('option', { name: 'Acme' }));

    await waitFor(() => {
      const companyValue = jotaiStore.get(dashboardFilterValuesAtom)[
        COMPANY_SLOT.id
      ];

      expect(companyValue?.operand).toBe(ViewFilterOperand.IS);
      expect(
        jsonRelationFilterValueSchema.parse(companyValue?.value ?? '')
          .selectedRecordIds,
      ).toEqual([ACME_COMPANY_ID]);
    });

    await waitFor(() => expect(getCompanyChipText()).toContain('Acme'));
  });

  it('renders a label for a value seeded from the URL without throwing', async () => {
    await renderDashboardFilterBar({
      urlDashboardFilterValues: {
        [COMPANY_SLOT.id]: {
          operand: ViewFilterOperand.IS,
          value: JSON.stringify({
            isCurrentWorkspaceMemberSelected: false,
            selectedRecordIds: [ACME_COMPANY_ID],
          }),
        },
      },
    });

    await waitFor(() => expect(getCompanyChipText()).toContain('Acme'));
    expect(getCompanyChipText()).not.toContain('selectedRecordIds');
    expect(
      jotaiStore.get(dashboardFilterValuesAtom)[COMPANY_SLOT.id]?.operand,
    ).toBe(ViewFilterOperand.IS);
  });
});
