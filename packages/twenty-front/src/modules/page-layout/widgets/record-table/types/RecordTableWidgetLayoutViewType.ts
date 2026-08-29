import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { getViewLayoutFromViewType, isDefined } from 'twenty-shared/utils';
import {
  IconCalendar,
  type IconComponent,
  IconLayoutKanban,
  IconList,
  IconTable,
} from 'twenty-ui/icon';
import { ViewType } from '~/generated-metadata/graphql';

// Declaration order is the order layouts are offered in the pickers.
export const RECORD_TABLE_WIDGET_LAYOUT_VIEW_TYPES = [
  ViewType.TABLE_WIDGET,
  ViewType.KANBAN_WIDGET,
  ViewType.LIST_WIDGET,
  ViewType.CALENDAR_WIDGET,
] as const;

export type RecordTableWidgetLayoutViewType =
  (typeof RECORD_TABLE_WIDGET_LAYOUT_VIEW_TYPES)[number];

export const RECORD_TABLE_WIDGET_LAYOUT_OPTIONS = {
  [ViewType.TABLE_WIDGET]: { Icon: IconTable, label: msg`Table` },
  [ViewType.KANBAN_WIDGET]: { Icon: IconLayoutKanban, label: msg`Kanban` },
  [ViewType.LIST_WIDGET]: { Icon: IconList, label: msg`List` },
  [ViewType.CALENDAR_WIDGET]: { Icon: IconCalendar, label: msg`Calendar` },
} satisfies Record<
  RecordTableWidgetLayoutViewType,
  { Icon: IconComponent; label: MessageDescriptor }
>;

// A widget view backed by a record table renders as a table unless its type
// names another layout, so anything else — including a missing view — reads as
// TABLE_WIDGET.
export const getRecordTableWidgetLayoutViewType = (
  viewType: ViewType | null | undefined,
): RecordTableWidgetLayoutViewType =>
  RECORD_TABLE_WIDGET_LAYOUT_VIEW_TYPES.find(
    (layoutViewType) => layoutViewType === viewType,
  ) ?? ViewType.TABLE_WIDGET;

// The layouts a record table widget can render, as opposed to the widget view
// types above: a widget backed by a plain LIST view still renders as a list.
export const RECORD_TABLE_WIDGET_LAYOUTS = [
  ViewType.TABLE,
  ViewType.KANBAN,
  ViewType.LIST,
  ViewType.CALENDAR,
] as const;

export type RecordTableWidgetLayout =
  (typeof RECORD_TABLE_WIDGET_LAYOUTS)[number];

export const getRecordTableWidgetLayout = (
  viewType: ViewType | null | undefined,
): RecordTableWidgetLayout =>
  RECORD_TABLE_WIDGET_LAYOUTS.find(
    (layout) =>
      isDefined(viewType) && layout === getViewLayoutFromViewType(viewType),
  ) ?? ViewType.TABLE;
