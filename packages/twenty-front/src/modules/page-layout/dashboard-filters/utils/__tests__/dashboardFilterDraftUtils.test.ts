import {
  COMPANY_ACCOUNT_OWNER,
  COMPANY_CREATED_AT,
  COMPANY_OBJECT_ID,
  PERSON_CREATED_AT,
  PERSON_OBJECT_ID,
  buildChartWidget,
  buildDashboardDraft,
  getDraftWidget,
} from '@/page-layout/dashboard-filters/testing/dashboardFilterTestFixtures';
import { addDashboardFilterSlotToDraft } from '@/page-layout/dashboard-filters/utils/addDashboardFilterSlotToDraft';
import { convertBuiltInDashboardFilterSlotsToPersistedInDraft } from '@/page-layout/dashboard-filters/utils/convertBuiltInDashboardFilterSlotsToPersistedInDraft';
import { getWidgetDashboardFilterBindings } from '@/page-layout/dashboard-filters/utils/getWidgetDashboardFilterBindings';
import { removeDashboardFilterSlotFromDraft } from '@/page-layout/dashboard-filters/utils/removeDashboardFilterSlotFromDraft';
import { restoreBuiltInDashboardFiltersInDraft } from '@/page-layout/dashboard-filters/utils/restoreBuiltInDashboardFiltersInDraft';
import { setWidgetDashboardFilterBindingInDraft } from '@/page-layout/dashboard-filters/utils/setWidgetDashboardFilterBindingInDraft';
import { updateDashboardFilterSlotInDraft } from '@/page-layout/dashboard-filters/utils/updateDashboardFilterSlotInDraft';
import { makeWidget } from '@/page-layout/testing/pageLayoutDraftFixtures';
import {
  type DashboardFilterSlot,
  ViewFilterOperand,
} from 'twenty-shared/types';

const DATE_SLOT: DashboardFilterSlot = {
  id: 'date-slot',
  label: 'Date',
  filterType: 'DATE_TIME',
};
const OWNER_SLOT: DashboardFilterSlot = {
  id: 'owner-slot',
  label: 'Owner',
  filterType: 'RELATION',
};

const FIELDS_WIDGET = makeWidget('fields-widget', 0);

const buildCustomDraft = () =>
  buildDashboardDraft({
    widgets: [
      buildChartWidget({
        id: 'companies',
        objectMetadataId: COMPANY_OBJECT_ID,
        dashboardFilterBindings: {
          [DATE_SLOT.id]: { fieldMetadataId: COMPANY_CREATED_AT.id },
          [OWNER_SLOT.id]: { fieldMetadataId: COMPANY_ACCOUNT_OWNER.id },
        },
      }),
      buildChartWidget({
        id: 'people',
        objectMetadataId: PERSON_OBJECT_ID,
        dashboardFilterBindings: {
          [DATE_SLOT.id]: { fieldMetadataId: PERSON_CREATED_AT.id },
          [OWNER_SLOT.id]: null,
        },
      }),
      FIELDS_WIDGET,
    ],
    dashboardFilters: [DATE_SLOT, OWNER_SLOT],
  });

describe('addDashboardFilterSlotToDraft', () => {
  it('appends the slot and writes a binding or an explicit null on every chart', () => {
    const slot: DashboardFilterSlot = {
      id: 'name-slot',
      label: 'Name',
      filterType: 'TEXT',
    };

    const draft = addDashboardFilterSlotToDraft({
      draft: buildCustomDraft(),
      slot,
      bindingsByWidgetId: { companies: { fieldMetadataId: 'company-name' } },
    });

    expect(draft.dashboardFilters).toEqual([DATE_SLOT, OWNER_SLOT, slot]);
    expect(
      getWidgetDashboardFilterBindings(getDraftWidget(draft, 'companies')),
    ).toMatchObject({ [slot.id]: { fieldMetadataId: 'company-name' } });
    expect(
      getWidgetDashboardFilterBindings(getDraftWidget(draft, 'people')),
    ).toMatchObject({ [slot.id]: null });
    expect(getDraftWidget(draft, FIELDS_WIDGET.id)).toBe(FIELDS_WIDGET);
  });

  it('starts an empty custom list when the dashboard has none yet', () => {
    const draft = addDashboardFilterSlotToDraft({
      draft: buildDashboardDraft({ widgets: [] }),
      slot: DATE_SLOT,
      bindingsByWidgetId: {},
    });

    expect(draft.dashboardFilters).toEqual([DATE_SLOT]);
  });
});

describe('updateDashboardFilterSlotInDraft', () => {
  it('updates only the targeted slot', () => {
    const defaultValue = { operand: ViewFilterOperand.IS_NOT_EMPTY, value: '' };

    const draft = updateDashboardFilterSlotInDraft({
      draft: buildCustomDraft(),
      slotId: DATE_SLOT.id,
      slotUpdate: { label: 'Created', isRequired: true, defaultValue },
    });

    expect(draft.dashboardFilters).toEqual([
      { ...DATE_SLOT, label: 'Created', isRequired: true, defaultValue },
      OWNER_SLOT,
    ]);
  });
});

describe('removeDashboardFilterSlotFromDraft', () => {
  it('drops the slot and its key from every chart binding', () => {
    const draft = removeDashboardFilterSlotFromDraft({
      draft: buildCustomDraft(),
      slotId: OWNER_SLOT.id,
    });

    expect(draft.dashboardFilters).toEqual([DATE_SLOT]);
    expect(
      getWidgetDashboardFilterBindings(getDraftWidget(draft, 'companies')),
    ).toEqual({ [DATE_SLOT.id]: { fieldMetadataId: COMPANY_CREATED_AT.id } });
    expect(
      getWidgetDashboardFilterBindings(getDraftWidget(draft, 'people')),
    ).toEqual({ [DATE_SLOT.id]: { fieldMetadataId: PERSON_CREATED_AT.id } });
  });

  it('leaves an empty list rather than null when the last slot goes', () => {
    const draft = removeDashboardFilterSlotFromDraft({
      draft: removeDashboardFilterSlotFromDraft({
        draft: buildCustomDraft(),
        slotId: OWNER_SLOT.id,
      }),
      slotId: DATE_SLOT.id,
    });

    expect(draft.dashboardFilters).toEqual([]);
    expect(
      getWidgetDashboardFilterBindings(getDraftWidget(draft, 'companies')),
    ).toEqual({});
  });
});

describe('setWidgetDashboardFilterBindingInDraft', () => {
  it('rebinds one chart without touching the others', () => {
    const draft = setWidgetDashboardFilterBindingInDraft({
      draft: buildCustomDraft(),
      widgetId: 'people',
      slotId: OWNER_SLOT.id,
      binding: { fieldMetadataId: 'person-company' },
    });

    expect(
      getWidgetDashboardFilterBindings(getDraftWidget(draft, 'people')),
    ).toEqual({
      [DATE_SLOT.id]: { fieldMetadataId: PERSON_CREATED_AT.id },
      [OWNER_SLOT.id]: { fieldMetadataId: 'person-company' },
    });
    expect(
      getWidgetDashboardFilterBindings(getDraftWidget(draft, 'companies')),
    ).toEqual(
      getWidgetDashboardFilterBindings(
        getDraftWidget(buildCustomDraft(), 'companies'),
      ),
    );
  });

  it('writes null to stop applying the slot to a chart', () => {
    const draft = setWidgetDashboardFilterBindingInDraft({
      draft: buildCustomDraft(),
      widgetId: 'companies',
      slotId: DATE_SLOT.id,
      binding: null,
    });

    expect(
      getWidgetDashboardFilterBindings(getDraftWidget(draft, 'companies')),
    ).toMatchObject({ [DATE_SLOT.id]: null });
  });
});

describe('convertBuiltInDashboardFilterSlotsToPersistedInDraft', () => {
  const builtInDraft = buildDashboardDraft({
    widgets: [
      buildChartWidget({
        id: 'companies',
        objectMetadataId: COMPANY_OBJECT_ID,
      }),
      buildChartWidget({ id: 'people', objectMetadataId: PERSON_OBJECT_ID }),
      FIELDS_WIDGET,
    ],
  });

  const builtInBindingsByWidgetId = {
    companies: {
      [DATE_SLOT.id]: { fieldMetadataId: COMPANY_CREATED_AT.id },
      [OWNER_SLOT.id]: { fieldMetadataId: COMPANY_ACCOUNT_OWNER.id },
    },
    people: {
      [DATE_SLOT.id]: { fieldMetadataId: PERSON_CREATED_AT.id },
    },
  };

  it('freezes the built-in slots and their resolved bindings into the draft', () => {
    const draft = convertBuiltInDashboardFilterSlotsToPersistedInDraft({
      draft: builtInDraft,
      builtInSlots: [DATE_SLOT, OWNER_SLOT],
      builtInBindingsByWidgetId,
    });

    expect(draft.dashboardFilters).toEqual([DATE_SLOT, OWNER_SLOT]);
    expect(
      getWidgetDashboardFilterBindings(getDraftWidget(draft, 'companies')),
    ).toEqual(builtInBindingsByWidgetId.companies);
    expect(
      getWidgetDashboardFilterBindings(getDraftWidget(draft, 'people')),
    ).toEqual({
      [DATE_SLOT.id]: { fieldMetadataId: PERSON_CREATED_AT.id },
      [OWNER_SLOT.id]: null,
    });
  });

  it('leaves a dashboard that already has custom slots untouched', () => {
    const customDraft = buildCustomDraft();

    expect(
      convertBuiltInDashboardFilterSlotsToPersistedInDraft({
        draft: customDraft,
        builtInSlots: [DATE_SLOT],
        builtInBindingsByWidgetId,
      }),
    ).toBe(customDraft);
  });
});

describe('restoreBuiltInDashboardFiltersInDraft', () => {
  it('goes back to null slots and drops every chart binding', () => {
    const draft = restoreBuiltInDashboardFiltersInDraft(buildCustomDraft());

    expect(draft.dashboardFilters).toBeNull();
    expect(getDraftWidget(draft, 'companies').configuration).not.toHaveProperty(
      'dashboardFilterBindings',
      expect.anything(),
    );
    expect(
      getWidgetDashboardFilterBindings(getDraftWidget(draft, 'people')),
    ).toEqual({});
  });
});
