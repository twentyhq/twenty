import { PAGE_LAYOUT_TEST_INSTANCE_ID } from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { pageLayoutEditingDashboardFilterSlotIdComponentState } from '@/page-layout/states/pageLayoutEditingDashboardFilterSlotIdComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
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
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

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

const getFieldLabelOrThrow = (
  objectMetadataItem: { fields: { name: string; label: string }[] },
  fieldName: string,
) => {
  const field = objectMetadataItem.fields.find(
    (field) => field.name === fieldName,
  );

  if (!isDefined(field)) {
    throw new Error(`Expected a ${fieldName} field`);
  }

  return field.label;
};

const COMPANY_NAME_SLOT: DashboardFilterSlot = {
  id: 'company-name-slot',
  label: 'Company name',
  filterType: 'TEXT',
  defaultOperand: ViewFilterOperand.CONTAINS,
};

const renderDetailSubPage = async ({
  slots = [CLOSING_MONTH_SLOT],
  widgets = [companyWidget, personWidget],
  editingSlotId = CLOSING_MONTH_SLOT.id,
}: {
  slots?: DashboardFilterSlot[];
  widgets?: PageLayoutWidget[];
  editingSlotId?: string;
} = {}) => {
  const pageLayout = setUpDashboardStore({
    widgets,
    dashboardFilters: slots,
  });

  jotaiStore.set(
    pageLayoutEditingDashboardFilterSlotIdComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    }),
    editingSlotId,
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

  it('changes a widget binding to another field of the same type', async () => {
    await renderDetailSubPage();

    const user = userEvent.setup();

    await user.click(screen.getByText('Companies'));
    await user.click(
      await screen.findByRole('option', {
        name: getFieldLabelOrThrow(companyObjectMetadataItem, 'updatedAt'),
      }),
    );

    await waitFor(() =>
      expect(
        getDraftWidgetBindings('company-widget')?.[CLOSING_MONTH_SLOT.id],
      ).toEqual({
        fieldMetadataId: getFieldIdOrThrow(
          companyObjectMetadataItem,
          'updatedAt',
        ),
      }),
    );
  });

  it('binds a widget through a one-hop relation target field', async () => {
    const nameBoundCompanyWidget = buildChartWidget({
      id: 'company-widget',
      title: 'Companies',
      objectMetadataId: companyObjectMetadataItem.id,
      dashboardFilterBindings: {
        [COMPANY_NAME_SLOT.id]: {
          fieldMetadataId: getFieldIdOrThrow(companyObjectMetadataItem, 'name'),
        },
      },
    });

    const unboundPersonWidget = buildChartWidget({
      id: 'person-widget',
      title: 'People',
      objectMetadataId: personObjectMetadataItem.id,
      dashboardFilterBindings: { [COMPANY_NAME_SLOT.id]: null },
    });

    await renderDetailSubPage({
      slots: [COMPANY_NAME_SLOT],
      widgets: [nameBoundCompanyWidget, unboundPersonWidget],
      editingSlotId: COMPANY_NAME_SLOT.id,
    });

    const user = userEvent.setup();

    await user.click(screen.getByText('People'));
    await user.click(
      await screen.findByRole('option', {
        name: getFieldLabelOrThrow(personObjectMetadataItem, 'company'),
      }),
    );
    await user.click(
      await screen.findByRole('option', {
        name: getFieldLabelOrThrow(companyObjectMetadataItem, 'name'),
      }),
    );

    await waitFor(() =>
      expect(
        getDraftWidgetBindings('person-widget')?.[COMPANY_NAME_SLOT.id],
      ).toEqual({
        fieldMetadataId: getFieldIdOrThrow(personObjectMetadataItem, 'company'),
        relationTargetFieldMetadataId: getFieldIdOrThrow(
          companyObjectMetadataItem,
          'name',
        ),
      }),
    );
  });

  it('ignores an empty label and keeps the stored one', async () => {
    await renderDetailSubPage();

    const user = userEvent.setup();

    const labelInput = screen.getByDisplayValue('Closing month');

    await user.clear(labelInput);
    await user.keyboard('{Enter}');

    await waitFor(() =>
      expect(screen.getByDisplayValue('Closing month')).toBeInTheDocument(),
    );

    const [slot] = jotaiStore.get(getDraftAtom())
      .dashboardFilters as DashboardFilterSlot[];

    expect(slot.label).toBe('Closing month');
  });

  it('stores a trimmed label', async () => {
    await renderDetailSubPage();

    const user = userEvent.setup();

    const labelInput = screen.getByDisplayValue('Closing month');

    await user.clear(labelInput);
    await user.type(labelInput, '  Close date  ');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      const [slot] = jotaiStore.get(getDraftAtom())
        .dashboardFilters as DashboardFilterSlot[];

      expect(slot.label).toBe('Close date');
    });
  });

  it('hints that a required filter is not applied to any chart while no widget binds it', async () => {
    const requiredSlot: DashboardFilterSlot = {
      ...CLOSING_MONTH_SLOT,
      isRequired: true,
    };

    const unboundCompanyWidget = buildChartWidget({
      id: 'company-widget',
      title: 'Companies',
      objectMetadataId: companyObjectMetadataItem.id,
      dashboardFilterBindings: { [CLOSING_MONTH_SLOT.id]: null },
    });

    await renderDetailSubPage({
      slots: [requiredSlot],
      widgets: [unboundCompanyWidget],
    });

    expect(
      screen.getByText('This filter is not applied to any chart yet'),
    ).toBeVisible();
  });

  it('shows no hint while a required filter is bound to at least one chart', async () => {
    await renderDetailSubPage({
      slots: [{ ...CLOSING_MONTH_SLOT, isRequired: true }],
    });

    expect(
      screen.queryByText('This filter is not applied to any chart yet'),
    ).not.toBeInTheDocument();
  });

  it('shows no hint for an optional filter without bindings', async () => {
    const unboundCompanyWidget = buildChartWidget({
      id: 'company-widget',
      title: 'Companies',
      objectMetadataId: companyObjectMetadataItem.id,
      dashboardFilterBindings: { [CLOSING_MONTH_SLOT.id]: null },
    });

    await renderDetailSubPage({ widgets: [unboundCompanyWidget] });

    expect(
      screen.queryByText('This filter is not applied to any chart yet'),
    ).not.toBeInTheDocument();
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

const opportunityObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('opportunity');

const STAGE_SLOT: DashboardFilterSlot = {
  id: 'stage-slot',
  label: 'Stage',
  filterType: 'SELECT',
};

const opportunityStageField = opportunityObjectMetadataItem.fields.find(
  (field) => field.name === 'stage',
);

if (
  !isDefined(opportunityStageField) ||
  !isDefined(opportunityStageField.options) ||
  opportunityStageField.options.length === 0
) {
  throw new Error(
    'Expected the opportunity mock to have a stage field with options',
  );
}

const [firstStageOption] = opportunityStageField.options;

const opportunityWidget = buildChartWidget({
  id: 'opportunity-widget',
  title: 'Opportunities',
  objectMetadataId: opportunityObjectMetadataItem.id,
  dashboardFilterBindings: {
    [STAGE_SLOT.id]: { fieldMetadataId: opportunityStageField.id },
  },
});

describe('SidePanelDashboardFilterDetailSubPage default value of a SELECT slot', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists the field options and stores the pick as the slot default', async () => {
    await renderDetailSubPage({
      slots: [STAGE_SLOT],
      widgets: [opportunityWidget],
      editingSlotId: STAGE_SLOT.id,
    });

    const user = userEvent.setup();

    await user.click(screen.getByText('Default value'));
    await user.click(
      await screen.findByRole('option', { name: firstStageOption.label }),
    );

    await waitFor(() => {
      const [slot] = jotaiStore.get(getDraftAtom())
        .dashboardFilters as DashboardFilterSlot[];

      expect(slot.defaultOperand).toBe(ViewFilterOperand.IS);
      expect(slot.defaultValue).toBe(JSON.stringify([firstStageOption.value]));
    });
  });
});
