import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useIsRecordDeleted } from '@/object-record/record-field/ui/hooks/useIsRecordDeleted';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { canReachSomeRecords, isDefined } from 'twenty-shared/utils';

// Mirrors the availability of the Edit Dashboard command, which Save and Cancel need too
export const useCanEditDashboardFilterDefaults = () => {
  const dashboardObjectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: StandardObjectNameSingular.Dashboard,
      objectNameType: 'singular',
    },
  );
  const dashboardObjectPermissions = useObjectPermissionsForObject(
    dashboardObjectMetadataItem?.id ?? '',
  );
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const { targetRecordIdentifier } = useLayoutRenderingContext();
  const isDashboardRecordDeleted = useIsRecordDeleted({
    recordId: targetRecordIdentifier?.id ?? '',
  });

  return (
    isDefined(dashboardObjectMetadataItem) &&
    canReachSomeRecords({
      objectRecordsPermissions: dashboardObjectPermissions,
      operationType: 'update',
    }) &&
    !isLayoutCustomizationModeEnabled &&
    !isDashboardRecordDeleted
  );
};
