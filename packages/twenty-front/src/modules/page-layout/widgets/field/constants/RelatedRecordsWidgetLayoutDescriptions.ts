import { type RecordTableWidgetLayoutViewType } from '@/page-layout/widgets/record-table/types/RecordTableWidgetLayoutViewType';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { ViewType } from '~/generated-metadata/graphql';

export const RELATED_RECORDS_WIDGET_LAYOUT_DESCRIPTIONS = {
  [ViewType.TABLE_WIDGET]: msg`Rows and columns`,
  [ViewType.KANBAN_WIDGET]: msg`Cards grouped by a Select field`,
  [ViewType.LIST_WIDGET]: msg`Compact list`,
  [ViewType.CALENDAR_WIDGET]: msg`Records by date`,
} satisfies Record<RecordTableWidgetLayoutViewType, MessageDescriptor>;
