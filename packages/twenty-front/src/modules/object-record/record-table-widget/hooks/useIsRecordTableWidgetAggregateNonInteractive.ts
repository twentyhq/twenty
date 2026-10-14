import { canEditRecordTableWidgetViewSettings } from '@/object-record/record-table-widget/utils/canEditRecordTableWidgetViewSettings';
import { RecordTableWidgetContext } from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useIsRecordTableWidgetAggregateNonInteractive = ():
  | boolean
  | undefined => {
  const recordTableWidgetContext = useContext(RecordTableWidgetContext);

  if (!isDefined(recordTableWidgetContext)) {
    return undefined;
  }

  return !canEditRecordTableWidgetViewSettings(recordTableWidgetContext);
};
