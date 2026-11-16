import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined, isWidgetViewType } from 'twenty-shared/utils';

// Widget views save their columns by field, so they cannot hold extra columns
export const useCanAddRecordTableLookupColumns = () => {
  const isLookupColumnsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_LOOKUP_COLUMNS_ENABLED,
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
