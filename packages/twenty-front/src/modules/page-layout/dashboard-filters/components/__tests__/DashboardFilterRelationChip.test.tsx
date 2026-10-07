import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { DashboardFilterBar } from '@/page-layout/dashboard-filters/components/DashboardFilterBar';
import { BUILT_IN_OWNER_DASHBOARD_FILTER_SLOT_ID } from '@/page-layout/dashboard-filters/constants/BuiltInOwnerDashboardFilterSlotId';
import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
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
  type DashboardFilterValue,
  ViewFilterOperand,
} from 'twenty-shared/types';
import {
  getDashboardFilterRecordFilterId,
  jsonRelationFilterValueSchema,
} from 'twenty-shared/utils';
import { ThemeProvider } from 'twenty-ui/theme';
import {
  FeatureFlagKey,
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { JestObjectMetadataItemSetter } from '~/testing/jest/JestObjectMetadataItemSetter';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

// The record picker and the chip label both query workspace members; the mock stands in for Apollo and returns none.
const mockUseRecordsForSelect = jest.fn();

jest.mock('@/object-record/select/hooks/useRecordsForSelect', () => ({
  useRecordsForSelect: (...args: unknown[]) => mockUseRecordsForSelect(...args),
}));

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const companyChartWidget = buildDraftPageLayoutWidget({
  id: 'company-widget',
  pageLayoutTabId: 'tab-1',
  title: 'Companies',
  type: WidgetType.GRAPH,
  configuration: buildDefaultBarChartConfiguration({}),
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

const renderDashboardFilterBar = async ({
  dashboardFilterValues = {},
}: {
  dashboardFilterValues?: Record<string, DashboardFilterValue | undefined>;
} = {}) => {
  resetJotaiStore();

  jotaiStore.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    featureFlags: [
      { key: FeatureFlagKey.IS_DASHBOARD_FILTERS_ENABLED, value: true },
    ],
  });

  jotaiStore.set(
    pageLayoutPersistedComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    }),
    {
      id: PAGE_LAYOUT_TEST_INSTANCE_ID,
      name: 'Dashboard',
      type: PageLayoutType.DASHBOARD,
      objectMetadataId: null,
      tabs: [
        makeTab('tab-1', [companyChartWidget], 0, PageLayoutTabLayoutMode.GRID),
      ],
    } as PageLayout,
  );

  jotaiStore.set(dashboardFilterValuesAtom, dashboardFilterValues);

  render(
    <I18nProvider i18n={i18n}>
      <ThemeProvider colorScheme="light">
        <JotaiProvider store={jotaiStore}>
          <MemoryRouter>
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
const getOwnerChipText = () =>
  screen.getByTestId(
    `remove-icon-${getDashboardFilterRecordFilterId(BUILT_IN_OWNER_DASHBOARD_FILTER_SLOT_ID)}`,
  ).parentElement?.textContent ?? '';

describe('DashboardFilter owner chip', () => {
  beforeEach(() => {
    mockUseRecordsForSelect.mockReturnValue({
      selectedRecords: [],
      filteredSelectedRecords: [],
      recordsToSelect: [],
      loading: false,
    });
  });

  it('writes the current workspace member relation value and labels the chip "Me"', async () => {
    await renderDashboardFilterBar();

    const user = userEvent.setup();

    await user.click(screen.getByText('Owner'));
    await user.click(await screen.findByRole('option', { name: 'Me' }));

    await waitFor(() => {
      const ownerValue = jotaiStore.get(dashboardFilterValuesAtom)[
        BUILT_IN_OWNER_DASHBOARD_FILTER_SLOT_ID
      ];

      expect(ownerValue?.operand).toBe(ViewFilterOperand.IS);
      expect(
        jsonRelationFilterValueSchema.parse(ownerValue?.value ?? '')
          .isCurrentWorkspaceMemberSelected,
      ).toBe(true);
    });

    await waitFor(() => expect(getOwnerChipText()).toContain('Me'));
  });

  it('never shows the raw relation value when the selected member cannot be found', async () => {
    const relationValue = JSON.stringify({
      isCurrentWorkspaceMemberSelected: false,
      selectedRecordIds: ['20202020-0000-4000-8000-000000000042'],
    });

    await renderDashboardFilterBar({
      dashboardFilterValues: {
        [BUILT_IN_OWNER_DASHBOARD_FILTER_SLOT_ID]: {
          operand: ViewFilterOperand.IS,
          value: relationValue,
        },
      },
    });

    expect(getOwnerChipText()).toContain('Owner');
    expect(getOwnerChipText()).not.toContain('selectedRecordIds');
    expect(getOwnerChipText()).not.toContain(relationValue);
  });
});
