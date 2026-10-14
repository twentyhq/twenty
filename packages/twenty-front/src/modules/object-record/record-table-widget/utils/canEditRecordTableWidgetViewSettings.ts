import { type RecordTableWidgetContextValue } from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';

export const canEditRecordTableWidgetViewSettings = (
  widgetContext: RecordTableWidgetContextValue,
): boolean =>
  widgetContext.isPageLayoutInEditMode && !widgetContext.isViewLocked;
