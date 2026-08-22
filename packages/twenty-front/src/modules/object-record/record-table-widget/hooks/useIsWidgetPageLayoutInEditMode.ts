import { RecordTableWidgetContext } from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';
import { useContext } from 'react';

// False outside a widget: the record index page has no page layout draft.
export const useIsWidgetPageLayoutInEditMode = () =>
  useContext(RecordTableWidgetContext)?.isPageLayoutInEditMode ?? false;
