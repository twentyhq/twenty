import { type RecordTableWidgetContextValue } from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';

export const canEditRecordTableWidgetViewSettings = ({
  isPageLayoutInEditMode,
  isViewLocked,
}: Pick<
  RecordTableWidgetContextValue,
  'isPageLayoutInEditMode' | 'isViewLocked'
>): boolean => isPageLayoutInEditMode && !isViewLocked;
