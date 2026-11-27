import { isLookupColumnsEnabledSelector } from '@/object-record/record-column-lookup/states/isLookupColumnsEnabledSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { isDefined, isWidgetViewType } from 'twenty-shared/utils';

// Widget views save their columns by field, so they cannot hold extra columns
export const useCanAddRecordTableLookupColumns = () => {
  const isLookupColumnsEnabled = useAtomStateValue(
    isLookupColumnsEnabledSelector,
  );
  const { canPersistChanges } = useCanPersistViewChanges();
  const { currentView } = useGetCurrentViewOnly();

  return (
    isLookupColumnsEnabled &&
    canPersistChanges &&
    isDefined(currentView) &&
    !isWidgetViewType(currentView.type)
  );
};
