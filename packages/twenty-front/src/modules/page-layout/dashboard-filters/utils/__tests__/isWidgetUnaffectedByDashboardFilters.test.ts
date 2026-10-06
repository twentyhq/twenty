import { isWidgetUnaffectedByDashboardFilters } from '@/page-layout/dashboard-filters/utils/isWidgetUnaffectedByDashboardFilters';
import {
  type DashboardFilterSlot,
  ViewFilterOperand,
} from 'twenty-shared/types';

const DATE_SLOT: DashboardFilterSlot = {
  id: 'date',
  label: 'Date',
  filterType: 'DATE_TIME',
};

const OWNER_SLOT: DashboardFilterSlot = {
  id: 'owner',
  label: 'Owner',
  filterType: 'RELATION',
};

const SLOTS = [DATE_SLOT, OWNER_SLOT];

const DATE_VALUE = { operand: ViewFilterOperand.IS_TODAY, value: '' };

const OWNER_VALUE = {
  operand: ViewFilterOperand.IS,
  value: JSON.stringify({
    isCurrentWorkspaceMemberSelected: true,
    selectedRecordIds: [],
  }),
};

const BINDINGS_BY_WIDGET_ID = {
  'chart-with-both': {
    date: { fieldMetadataId: 'created-at' },
    owner: { fieldMetadataId: 'owner' },
  },
  'chart-with-date-only': {
    date: { fieldMetadataId: 'created-at' },
    owner: null,
  },
  'chart-with-nothing': {
    date: null,
    owner: null,
  },
};

describe('isWidgetUnaffectedByDashboardFilters', () => {
  it('is false while no slot has a value', () => {
    expect(
      isWidgetUnaffectedByDashboardFilters({
        widgetId: 'chart-with-nothing',
        slots: SLOTS,
        values: {},
        bindingsByWidgetId: BINDINGS_BY_WIDGET_ID,
      }),
    ).toBe(false);
  });

  it('is true when the widget binds none of the valued slots', () => {
    expect(
      isWidgetUnaffectedByDashboardFilters({
        widgetId: 'chart-with-date-only',
        slots: SLOTS,
        values: { owner: OWNER_VALUE },
        bindingsByWidgetId: BINDINGS_BY_WIDGET_ID,
      }),
    ).toBe(true);
  });

  it('is false as soon as one valued slot reaches the widget', () => {
    expect(
      isWidgetUnaffectedByDashboardFilters({
        widgetId: 'chart-with-date-only',
        slots: SLOTS,
        values: { date: DATE_VALUE, owner: OWNER_VALUE },
        bindingsByWidgetId: BINDINGS_BY_WIDGET_ID,
      }),
    ).toBe(false);
  });

  it('ignores a value the slot would not apply', () => {
    expect(
      isWidgetUnaffectedByDashboardFilters({
        widgetId: 'chart-with-nothing',
        slots: SLOTS,
        values: { owner: { operand: ViewFilterOperand.IS, value: '' } },
        bindingsByWidgetId: BINDINGS_BY_WIDGET_ID,
      }),
    ).toBe(false);
  });

  it('ignores a value for a slot that does not exist', () => {
    expect(
      isWidgetUnaffectedByDashboardFilters({
        widgetId: 'chart-with-nothing',
        slots: SLOTS,
        values: { unknown: DATE_VALUE },
        bindingsByWidgetId: BINDINGS_BY_WIDGET_ID,
      }),
    ).toBe(false);
  });

  it('is false for a widget unknown to the bindings', () => {
    expect(
      isWidgetUnaffectedByDashboardFilters({
        widgetId: 'record-table',
        slots: SLOTS,
        values: { date: DATE_VALUE },
        bindingsByWidgetId: BINDINGS_BY_WIDGET_ID,
      }),
    ).toBe(false);
  });
});
