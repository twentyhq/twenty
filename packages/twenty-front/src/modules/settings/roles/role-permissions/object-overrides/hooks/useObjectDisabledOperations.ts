import { getApplicationDisplayName } from '@/applications/utils/getApplicationDisplayName';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/object-overrides/constants/SettingsRoleObjectPermissionIconConfig';
import { getObjectDisabledOperationReason } from '@/settings/roles/role-permissions/object-overrides/utils/getObjectDisabledOperationReason';
import { getObjectDisabledOperations } from '@/settings/roles/role-permissions/object-overrides/utils/getObjectDisabledOperations';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

export const useObjectDisabledOperations = (
  objectMetadataItem: EnrichedObjectMetadataItem | undefined,
) => {
  const { t } = useLingui();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const disabledOperations = getObjectDisabledOperations(objectMetadataItem);

  const application = currentWorkspace?.installedApplications.find(
    (installedApplication) =>
      installedApplication.id === objectMetadataItem?.applicationId,
  );

  const applicationName = isDefined(application)
    ? getApplicationDisplayName({ application, currentWorkspace })
    : t`its app`;

  const disabledOperationReasons: Partial<
    Record<SettingsRoleObjectPermissionKey, string>
  > = Object.fromEntries(
    disabledOperations.map((operation) => [
      operation,
      getObjectDisabledOperationReason({ operation, applicationName }),
    ]),
  );

  const getDisabledOperationReason = (
    operation: SettingsRoleObjectPermissionKey,
  ) => disabledOperationReasons[operation];

  return {
    disabledOperations,
    disabledOperationReasons,
    getDisabledOperationReason,
  };
};
