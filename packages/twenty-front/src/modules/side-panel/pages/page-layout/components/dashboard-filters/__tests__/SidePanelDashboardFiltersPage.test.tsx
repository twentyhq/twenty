import { PAGE_LAYOUT_TEST_INSTANCE_ID } from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { pageLayoutEditingDashboardFilterSlotIdComponentState } from '@/page-layout/states/pageLayoutEditingDashboardFilterSlotIdComponentState';
import { SidePanelDashboardFiltersPage } from '@/side-panel/pages/page-layout/components/dashboard-filters/SidePanelDashboardFiltersPage';
import { SidePanelSubPages } from '@/side-panel/types/SidePanelSubPages';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  type DashboardFilterSlot,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  buildChartWidget,
  companyObjectMetadataItem,
  getDraftAtom,
  getDraftWidgetBindings,
  getFieldIdOrThrow,
  personObjectMetadataItem,
  renderInSidePanel,
  setUpDashboardStore,
} from './dashboardFilterSidePanelTestUtils';

const mockNavigateToSidePanelSubPage = jest.fn();

jest.mock(
  '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore',
  () => ({
    usePageLayoutIdFromContextStore: () => ({
      pageLayoutId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      recordId: 'dashboard-record-id',
      objectNameSingular: 'dashboard',
    }),
  }),
);

jest.mock('@/side-panel/hooks/useSidePanelSubPageHistory', () => ({
  useSidePanelSubPageHistory: () => ({
    navigateToSidePanelSubPage: mockNavigateToSidePanelSubPage,
    goBackFromSidePanelSubPage: jest.fn(),
  }),
}));

const CLOSING_MONTH_SLOT: DashboardFilterSlot = {
  id: 'closing-month-slot',
  label: 'Closing month',
  filterType: 'DATE_TIME',
  defaultOperand: ViewFilterOperand.IS_RELATIVE,
};

const companyCreatedAtFieldId = getFieldIdOrThrow(
  companyObjectMetadataItem,
  'createdAt',
);

const companyWidget = buildChartWidget({
  id: 'company-widget',
  title: 'Companies',
  objectMetadataId: companyObjectMetadataItem.id,
  dashboardFilterBindings: {
    [CLOSING_MONTH_SLOT.id]: { fieldMetadataId: companyCreatedAtFieldId },
  },
});

const personWidget = buildChartWidget({
  id: 'person-widget',
  title: 'People',
  objectMetadataId: personObjectMetadataItem.id,
  dashboardFilterBindings: { [CLOSING_MONTH_SLOT.id]: null },
});

describe('SidePanelDashboardFiltersPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists the slots with their type and bound widget count and opens the detail sub-page', async () => {
    setUpDashboardStore({
      widgets: [companyWidget, personWidget],
      dashboardFilters: [CLOSING_MONTH_SLOT],
    });

    await renderInSidePanel(<SidePanelDashboardFiltersPage />);

    expect(screen.getByText('Closing month')).toBeVisible();
    expect(screen.getByText(/1 of 2 widgets/)).toBeVisible();

    await userEvent.setup().click(screen.getByText('Closing month'));

    expect(
      jotaiStore.get(
        pageLayoutEditingDashboardFilterSlotIdComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
      ),
    ).toBe(CLOSING_MONTH_SLOT.id);
    expect(mockNavigateToSidePanelSubPage).toHaveBeenCalledWith(
      SidePanelSubPages.PageLayoutDashboardFilterDetail,
      'Closing month',
    );
  });

  it('adds a dimension as a new slot with auto-computed bindings on every chart widget', async () => {
    setUpDashboardStore({
      widgets: [companyWidget, personWidget],
      dashboardFilters: [CLOSING_MONTH_SLOT],
    });

    await renderInSidePanel(<SidePanelDashboardFiltersPage />);

    const user = userEvent.setup();

    await user.click(screen.getByText('Add filter'));
    await user.click(
      await screen.findByRole('option', {
        name: new RegExp(`^${companyObjectMetadataItem.labelSingular}`),
      }),
    );

    await waitFor(() =>
      expect(jotaiStore.get(getDraftAtom()).dashboardFilters).toHaveLength(2),
    );

    const [, companySlot] = jotaiStore.get(getDraftAtom())
      .dashboardFilters as DashboardFilterSlot[];

    expect(companySlot).toMatchObject({
      label: companyObjectMetadataItem.labelSingular,
      filterType: 'RELATION',
      defaultOperand: ViewFilterOperand.IS,
      isRequired: false,
    });
    expect(getDraftWidgetBindings('company-widget')?.[companySlot.id]).toEqual({
      fieldMetadataId: getFieldIdOrThrow(companyObjectMetadataItem, 'id'),
    });
    expect(getDraftWidgetBindings('person-widget')?.[companySlot.id]).toEqual({
      fieldMetadataId: getFieldIdOrThrow(personObjectMetadataItem, 'company'),
    });
    expect(mockNavigateToSidePanelSubPage).toHaveBeenCalledWith(
      SidePanelSubPages.PageLayoutDashboardFilterDetail,
      companyObjectMetadataItem.labelSingular,
    );
  });

  it('shows the built-ins greyed out with a hint and offers Date and Owner first when the dashboard was never configured', async () => {
    setUpDashboardStore({
      widgets: [companyWidget],
      dashboardFilters: null,
    });

    await renderInSidePanel(<SidePanelDashboardFiltersPage />);

    expect(
      screen.getByText('Built-in filters. Add a filter to customize.'),
    ).toBeVisible();
    expect(screen.getByText('Date')).toBeVisible();
    expect(screen.getByText('Owner')).toBeVisible();

    const user = userEvent.setup();

    await user.click(screen.getByText('Add filter'));

    const options = await screen.findAllByRole('option');

    expect(options[0]).toHaveTextContent(/^Date/);
    expect(options[1]).toHaveTextContent(/^Owner/);

    await user.click(options[0]);

    await waitFor(() => {
      const dashboardFilters = jotaiStore.get(getDraftAtom())
        .dashboardFilters as DashboardFilterSlot[] | null;

      expect(dashboardFilters).toHaveLength(1);
      expect(dashboardFilters?.[0]).toMatchObject({
        label: 'Date',
        filterType: 'DATE_TIME',
      });
    });

    const [dateSlot] = jotaiStore.get(getDraftAtom())
      .dashboardFilters as DashboardFilterSlot[];

    expect(isDefined(dateSlot)).toBe(true);
    expect(getDraftWidgetBindings('company-widget')?.[dateSlot.id]).toEqual({
      fieldMetadataId: companyCreatedAtFieldId,
    });
  });
});
