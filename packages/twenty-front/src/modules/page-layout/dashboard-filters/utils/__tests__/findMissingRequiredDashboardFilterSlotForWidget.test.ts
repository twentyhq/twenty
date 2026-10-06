import { type DashboardFilterBindingsByWidgetId } from '@/page-layout/dashboard-filters/types/DashboardFilterBindingsByWidgetId';
import { findMissingRequiredDashboardFilterSlotForWidget } from '@/page-layout/dashboard-filters/utils/findMissingRequiredDashboardFilterSlotForWidget';
import {
  type DashboardFilterSlot,
  ViewFilterOperand,
} from 'twenty-shared/types';

const TODAY_VALUE = { operand: ViewFilterOperand.IS_TODAY, value: '' };

const REQUIRED_DATE_SLOT: DashboardFilterSlot = {
  id: 'date',
  label: 'Date',
  filterType: 'DATE_TIME',
  isRequired: true,
};

const REQUIRED_OWNER_SLOT: DashboardFilterSlot = {
  id: 'owner',
  label: 'Owner',
  filterType: 'RELATION',
  isRequired: true,
};

const OPTIONAL_STAGE_SLOT: DashboardFilterSlot = {
  id: 'stage',
  label: 'Stage',
  filterType: 'SELECT',
};

const SLOTS = [REQUIRED_DATE_SLOT, REQUIRED_OWNER_SLOT, OPTIONAL_STAGE_SLOT];

const BINDINGS_BY_WIDGET_ID: DashboardFilterBindingsByWidgetId = {
  'bound-chart': {
    date: { fieldMetadataId: 'created-at' },
    owner: { fieldMetadataId: 'account-owner' },
    stage: null,
  },
  'unbound-chart': {
    date: null,
    owner: null,
    stage: { fieldMetadataId: 'stage' },
  },
};

describe('findMissingRequiredDashboardFilterSlotForWidget', () => {
  it('returns the first required slot the widget binds that has no value', () => {
    expect(
      findMissingRequiredDashboardFilterSlotForWidget({
        widgetId: 'bound-chart',
        slots: SLOTS,
        values: {},
        bindingsByWidgetId: BINDINGS_BY_WIDGET_ID,
      }),
    ).toBe(REQUIRED_DATE_SLOT);
  });

  it('skips a required slot that holds a valid value', () => {
    expect(
      findMissingRequiredDashboardFilterSlotForWidget({
        widgetId: 'bound-chart',
        slots: SLOTS,
        values: { date: TODAY_VALUE },
        bindingsByWidgetId: BINDINGS_BY_WIDGET_ID,
      }),
    ).toBe(REQUIRED_OWNER_SLOT);
  });

  it('treats an invalid value as missing', () => {
    expect(
      findMissingRequiredDashboardFilterSlotForWidget({
        widgetId: 'bound-chart',
        slots: [REQUIRED_DATE_SLOT],
        values: { date: { operand: ViewFilterOperand.CONTAINS, value: 'x' } },
        bindingsByWidgetId: BINDINGS_BY_WIDGET_ID,
      }),
    ).toBe(REQUIRED_DATE_SLOT);
  });

  it('returns undefined when every required bound slot has a value', () => {
    expect(
      findMissingRequiredDashboardFilterSlotForWidget({
        widgetId: 'bound-chart',
        slots: SLOTS,
        values: {
          date: TODAY_VALUE,
          owner: {
            operand: ViewFilterOperand.IS,
            value: JSON.stringify({
              isCurrentWorkspaceMemberSelected: true,
              selectedRecordIds: [],
            }),
          },
        },
        bindingsByWidgetId: BINDINGS_BY_WIDGET_ID,
      }),
    ).toBeUndefined();
  });

  it('ignores required slots the widget does not bind', () => {
    expect(
      findMissingRequiredDashboardFilterSlotForWidget({
        widgetId: 'unbound-chart',
        slots: SLOTS,
        values: {},
        bindingsByWidgetId: BINDINGS_BY_WIDGET_ID,
      }),
    ).toBeUndefined();
  });

  it('ignores optional slots without value', () => {
    expect(
      findMissingRequiredDashboardFilterSlotForWidget({
        widgetId: 'unbound-chart',
        slots: [OPTIONAL_STAGE_SLOT],
        values: {},
        bindingsByWidgetId: BINDINGS_BY_WIDGET_ID,
      }),
    ).toBeUndefined();
  });

  it('returns undefined for a widget that is not a chart', () => {
    expect(
      findMissingRequiredDashboardFilterSlotForWidget({
        widgetId: 'record-table',
        slots: SLOTS,
        values: {},
        bindingsByWidgetId: BINDINGS_BY_WIDGET_ID,
      }),
    ).toBeUndefined();
  });
});
