import { isWidgetUnaffectedByDashboardFilters } from '@/page-layout/dashboard-filters/utils/isWidgetUnaffectedByDashboardFilters';
import {
  type DashboardFilterSlot,
  type DashboardFilterValue,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { WidgetType } from '~/generated-metadata/graphql';

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

const DATE_VALUE: DashboardFilterValue = {
  operand: ViewFilterOperand.IS_AFTER,
  value: '2026-01-01T00:00:00.000Z',
};

const OWNER_VALUE: DashboardFilterValue = {
  operand: ViewFilterOperand.IS,
  value: '{"isCurrentWorkspaceMemberSelected":true,"selectedRecordIds":[]}',
};

const GRAPH_WIDGET = { type: WidgetType.GRAPH };

describe('isWidgetUnaffectedByDashboardFilters', () => {
  it('is true when a slot has a value and the widget binds nothing', () => {
    expect(
      isWidgetUnaffectedByDashboardFilters({
        widget: GRAPH_WIDGET,
        slots: SLOTS,
        values: { date: DATE_VALUE },
        bindings: undefined,
      }),
    ).toBe(true);
  });

  it('is true when the only binding for the valued slot is null', () => {
    expect(
      isWidgetUnaffectedByDashboardFilters({
        widget: GRAPH_WIDGET,
        slots: SLOTS,
        values: { date: DATE_VALUE },
        bindings: { date: null },
      }),
    ).toBe(true);
  });

  it('is false when no slot has a value', () => {
    expect(
      isWidgetUnaffectedByDashboardFilters({
        widget: GRAPH_WIDGET,
        slots: SLOTS,
        values: {},
        bindings: undefined,
      }),
    ).toBe(false);
  });

  it('is false when the widget is bound to a valued slot', () => {
    expect(
      isWidgetUnaffectedByDashboardFilters({
        widget: GRAPH_WIDGET,
        slots: SLOTS,
        values: { date: DATE_VALUE },
        bindings: { date: { fieldMetadataId: 'created-at-id' } },
      }),
    ).toBe(false);
  });

  it('is true when the widget is bound only to an unvalued slot while another slot has a value', () => {
    expect(
      isWidgetUnaffectedByDashboardFilters({
        widget: GRAPH_WIDGET,
        slots: SLOTS,
        values: { owner: OWNER_VALUE },
        bindings: { date: { fieldMetadataId: 'created-at-id' } },
      }),
    ).toBe(true);
  });

  it('is false when the widget is bound to one of two valued slots', () => {
    expect(
      isWidgetUnaffectedByDashboardFilters({
        widget: GRAPH_WIDGET,
        slots: SLOTS,
        values: { date: DATE_VALUE, owner: OWNER_VALUE },
        bindings: { owner: { fieldMetadataId: 'account-owner-id' } },
      }),
    ).toBe(false);
  });

  it('ignores a value the merge would drop as invalid', () => {
    expect(
      isWidgetUnaffectedByDashboardFilters({
        widget: GRAPH_WIDGET,
        slots: SLOTS,
        values: { date: { operand: ViewFilterOperand.IS_AFTER, value: '' } },
        bindings: undefined,
      }),
    ).toBe(false);
  });

  it.each([
    WidgetType.RECORD_TABLE,
    WidgetType.IFRAME,
    WidgetType.STANDALONE_RICH_TEXT,
    WidgetType.FRONT_COMPONENT,
    WidgetType.FIELDS,
    WidgetType.TIMELINE,
  ])('never applies to %s widgets', (widgetType) => {
    expect(
      isWidgetUnaffectedByDashboardFilters({
        widget: { type: widgetType },
        slots: SLOTS,
        values: { date: DATE_VALUE },
        bindings: undefined,
      }),
    ).toBe(false);
  });
});
