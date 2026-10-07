import { findDashboardFilterSlotForChartBucket } from '@/page-layout/dashboard-filters/utils/findDashboardFilterSlotForChartBucket';
import { type DashboardFilterSlot } from 'twenty-shared/types';

const WIDGET = { id: 'widget-1' };
const STAGE_FIELD_ID = '4e029608-6039-4720-9119-61aa6db12430';
const COMPANY_FIELD_ID = '4cafe09c-e246-4de8-a4f3-8c60e1186395';
const COMPANY_NAME_FIELD_ID = '7ad9bbb4-1c9b-4b2a-9fd4-9f3f3e0f8c11';

const STAGE_SLOT: DashboardFilterSlot = {
  id: 'stage-slot',
  label: 'Stage',
  filterType: 'SELECT',
};

const COMPANY_SLOT: DashboardFilterSlot = {
  id: 'company-slot',
  label: 'Company',
  filterType: 'RELATION',
};

const CURRENCY_SLOT: DashboardFilterSlot = {
  id: 'currency-slot',
  label: 'Currency',
  filterType: 'CURRENCY',
};

describe('findDashboardFilterSlotForChartBucket', () => {
  it('returns the slot this widget binds to the group-by field', () => {
    const slot = findDashboardFilterSlotForChartBucket({
      widget: WIDGET,
      slots: [COMPANY_SLOT, STAGE_SLOT],
      bindingsByWidgetId: {
        [WIDGET.id]: {
          [COMPANY_SLOT.id]: { fieldMetadataId: COMPANY_FIELD_ID },
          [STAGE_SLOT.id]: { fieldMetadataId: STAGE_FIELD_ID },
        },
      },
      groupByFieldMetadataId: STAGE_FIELD_ID,
      groupBySubFieldName: null,
    });

    expect(slot).toBe(STAGE_SLOT);
  });

  it('matches a composite field only on the same sub-field', () => {
    const bindingsByWidgetId = {
      [WIDGET.id]: {
        [CURRENCY_SLOT.id]: {
          fieldMetadataId: STAGE_FIELD_ID,
          subFieldName: 'currencyCode' as const,
        },
      },
    };

    expect(
      findDashboardFilterSlotForChartBucket({
        widget: WIDGET,
        slots: [CURRENCY_SLOT],
        bindingsByWidgetId,
        groupByFieldMetadataId: STAGE_FIELD_ID,
        groupBySubFieldName: 'currencyCode',
      }),
    ).toBe(CURRENCY_SLOT);

    expect(
      findDashboardFilterSlotForChartBucket({
        widget: WIDGET,
        slots: [CURRENCY_SLOT],
        bindingsByWidgetId,
        groupByFieldMetadataId: STAGE_FIELD_ID,
        groupBySubFieldName: 'amountMicros',
      }),
    ).toBeUndefined();

    expect(
      findDashboardFilterSlotForChartBucket({
        widget: WIDGET,
        slots: [CURRENCY_SLOT],
        bindingsByWidgetId,
        groupByFieldMetadataId: STAGE_FIELD_ID,
        groupBySubFieldName: null,
      }),
    ).toBeUndefined();
  });

  it('never matches a binding through a relation target field', () => {
    const slot = findDashboardFilterSlotForChartBucket({
      widget: WIDGET,
      slots: [COMPANY_SLOT],
      bindingsByWidgetId: {
        [WIDGET.id]: {
          [COMPANY_SLOT.id]: {
            fieldMetadataId: COMPANY_FIELD_ID,
            relationTargetFieldMetadataId: COMPANY_NAME_FIELD_ID,
          },
        },
      },
      groupByFieldMetadataId: COMPANY_FIELD_ID,
      groupBySubFieldName: null,
    });

    expect(slot).toBeUndefined();
  });

  it('ignores an explicitly unapplied binding and other widgets bindings', () => {
    expect(
      findDashboardFilterSlotForChartBucket({
        widget: WIDGET,
        slots: [STAGE_SLOT],
        bindingsByWidgetId: {
          [WIDGET.id]: { [STAGE_SLOT.id]: null },
          'widget-2': { [STAGE_SLOT.id]: { fieldMetadataId: STAGE_FIELD_ID } },
        },
        groupByFieldMetadataId: STAGE_FIELD_ID,
        groupBySubFieldName: null,
      }),
    ).toBeUndefined();
  });

  it('returns nothing without slots or without a group-by field', () => {
    expect(
      findDashboardFilterSlotForChartBucket({
        widget: WIDGET,
        slots: [],
        bindingsByWidgetId: {},
        groupByFieldMetadataId: STAGE_FIELD_ID,
        groupBySubFieldName: null,
      }),
    ).toBeUndefined();

    expect(
      findDashboardFilterSlotForChartBucket({
        widget: WIDGET,
        slots: [STAGE_SLOT],
        bindingsByWidgetId: {
          [WIDGET.id]: { [STAGE_SLOT.id]: { fieldMetadataId: STAGE_FIELD_ID } },
        },
        groupByFieldMetadataId: undefined,
        groupBySubFieldName: null,
      }),
    ).toBeUndefined();
  });
});
