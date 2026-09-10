import { type RecordTableWidgetContextValue } from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';
import { isDefined } from 'twenty-shared/utils';

// View metadata belongs to the layout: a live widget must never persist view
// changes inline, only the page-layout editor writes them, through the draft.
export type ViewPersistTarget =
  | { target: 'api' }
  | { target: 'none' }
  | { target: 'pageLayoutDraft'; widgetContext: RecordTableWidgetContextValue };

export const getViewPersistTarget = (
  widgetContext: RecordTableWidgetContextValue | null,
): ViewPersistTarget => {
  if (!isDefined(widgetContext)) {
    return { target: 'api' };
  }

  if (
    widgetContext.isPageLayoutInEditMode &&
    isDefined(widgetContext.pageLayoutId)
  ) {
    return { target: 'pageLayoutDraft', widgetContext };
  }

  return { target: 'none' };
};
