import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
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
