import { PAGE_LAYOUT_TEST_INSTANCE_ID } from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { pageLayoutEditingDashboardFilterSlotIdComponentState } from '@/page-layout/states/pageLayoutEditingDashboardFilterSlotIdComponentState';
import { toDraftPageLayout } from '@/page-layout/utils/toDraftPageLayout';
import { SidePanelDashboardFilterDetailSubPage } from '@/side-panel/pages/page-layout/components/dashboard-filters/SidePanelDashboardFilterDetailSubPage';
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
  getPersistedAtom,
  personObjectMetadataItem,
  renderInSidePanel,
  setUpDashboardStore,
} from './dashboardFilterSidePanelTestUtils';

const mockGoBackFromSidePanelSubPage = jest.fn();

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
    navigateToSidePanelSubPage: jest.fn(),
    goBackFromSidePanelSubPage: mockGoBackFromSidePanelSubPage,
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
const personCreatedAtFieldId = getFieldIdOrThrow(
  personObjectMetadataItem,
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
  dashboardFilterBindings: {
    [CLOSING_MONTH_SLOT.id]: { fieldMetadataId: personCreatedAtFieldId },
  },
});

const renderDetailSubPage = async () => {
  const pageLayout = setUpDashboardStore({
    widgets: [companyWidget, personWidget],
    dashboardFilters: [CLOSING_MONTH_SLOT],
  });

  jotaiStore.set(
    pageLayoutEditingDashboardFilterSlotIdComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    }),
    CLOSING_MONTH_SLOT.id,
  );

  await renderInSidePanel(<SidePanelDashboardFilterDetailSubPage />);

  return pageLayout;
};

describe('SidePanelDashboardFilterDetailSubPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the slot label and one row per chart widget with its bound field', async () => {
    await renderDetailSubPage();

    expect(screen.getByDisplayValue('Closing month')).toBeVisible();
    expect(screen.getByText('Companies')).toBeVisible();
    expect(screen.getByText('People')).toBeVisible();
    expect(screen.getByText('Required')).toBeVisible();
    expect(screen.getByText('Delete filter')).toBeVisible();
  });

  it('sets a widget binding to Not applied in the draft only', async () => {
    const pageLayout = await renderDetailSubPage();

    const user = userEvent.setup();

    await user.click(screen.getByText('People'));
    await user.click(
      await screen.findByRole('option', { name: 'Not applied' }),
    );

    await waitFor(() =>
      expect(
        getDraftWidgetBindings('person-widget')?.[CLOSING_MONTH_SLOT.id],
      ).toBeNull(),
    );

    expect(
      getDraftWidgetBindings('company-widget')?.[CLOSING_MONTH_SLOT.id],
    ).toEqual({ fieldMetadataId: companyCreatedAtFieldId });
    expect(jotaiStore.get(getPersistedAtom())).toBe(pageLayout);
  });

  it('toggles the required flag on the slot', async () => {
    await renderDetailSubPage();

    await userEvent.setup().click(screen.getByText('Required'));

    await waitFor(() => {
      const [slot] = jotaiStore.get(getDraftAtom())
        .dashboardFilters as DashboardFilterSlot[];

      expect(slot.isRequired).toBe(true);
    });
  });

  it('deletes the slot and sweeps its bindings after confirmation, and a draft reset restores them', async () => {
    const pageLayout = await renderDetailSubPage();

    const user = userEvent.setup();

    await user.click(screen.getByText('Delete filter'));
    await user.click(
      await screen.findByTestId('confirmation-modal-confirm-button'),
    );

    await waitFor(() =>
      expect(jotaiStore.get(getDraftAtom()).dashboardFilters).toEqual([]),
    );

    expect(getDraftWidgetBindings('company-widget')).toEqual({});
    expect(getDraftWidgetBindings('person-widget')).toEqual({});
    expect(mockGoBackFromSidePanelSubPage).toHaveBeenCalledTimes(1);

    // Cancel resets the draft from the untouched persisted layout.
    const persistedPageLayout = jotaiStore.get(getPersistedAtom());

    expect(persistedPageLayout).toBe(pageLayout);

    if (!isDefined(persistedPageLayout)) {
      throw new Error('Expected the persisted layout to be set');
    }

    jotaiStore.set(getDraftAtom(), toDraftPageLayout(persistedPageLayout));

    expect(jotaiStore.get(getDraftAtom()).dashboardFilters).toEqual([
      CLOSING_MONTH_SLOT,
    ]);
    expect(
      getDraftWidgetBindings('person-widget')?.[CLOSING_MONTH_SLOT.id],
    ).toEqual({ fieldMetadataId: personCreatedAtFieldId });
  });
});
