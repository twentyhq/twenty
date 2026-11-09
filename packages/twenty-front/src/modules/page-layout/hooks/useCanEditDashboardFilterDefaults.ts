import { useIsThirdPartyApplication } from '@/applications/hooks/useIsThirdPartyApplication';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useIsRecordDeleted } from '@/object-record/record-field/ui/hooks/useIsRecordDeleted';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
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
  const pageLayoutPersisted = useAtomComponentStateValue(
    pageLayoutPersistedComponentState,
  );
  const isOwnedByThirdPartyApplication = useIsThirdPartyApplication(
    pageLayoutPersisted?.applicationId,
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
    !isOwnedByThirdPartyApplication &&
    !isDashboardRecordDeleted
  );
};
