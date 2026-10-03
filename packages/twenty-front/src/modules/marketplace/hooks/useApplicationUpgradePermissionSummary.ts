import { buildPermissionSummaryFromRoleGrants } from '@/marketplace/utils/buildPermissionSummaryFromRoleGrants';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useActionRolePermissionFlagConfig } from '@/settings/roles/role-permissions/permission-flags/hooks/useActionRolePermissionFlagConfig';
import { useSettingsRolePermissionFlagConfig } from '@/settings/roles/role-permissions/permission-flags/hooks/useSettingsRolePermissionFlagConfig';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { FindApplicationUpgradeRoleGrantsDocument } from '~/generated-metadata/graphql';

export const useApplicationUpgradePermissionSummary = ({
  applicationId,
  skip,
}: {
  applicationId: string;
  skip: boolean;
}) => {
  const { data, loading, error, refetch } = useQuery(
    FindApplicationUpgradeRoleGrantsDocument,
    {
      variables: { applicationId },
      skip,
      fetchPolicy: 'network-only',
    },
  );

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const settingsPermissionFlags = useSettingsRolePermissionFlagConfig();
  const actionPermissionFlags = useActionRolePermissionFlagConfig();

  const permissionSummaryItems = useMemo(
    () =>
      buildPermissionSummaryFromRoleGrants({
        grants: data?.applicationUpgradeRoleGrants ?? [],
        objects: objectMetadataItems,
        permissionFlags: [...settingsPermissionFlags, ...actionPermissionFlags],
      }),
    [data, objectMetadataItems, settingsPermissionFlags, actionPermissionFlags],
  );

  const hasPermissionSummaryError = !skip && isDefined(error);

  return {
    permissionSummaryItems:
      skip || hasPermissionSummaryError ? [] : permissionSummaryItems,
    isPermissionSummaryReady:
      skip || (!loading && !isDefined(error) && isDefined(data)),
    hasPermissionSummaryError,
    refetchPermissionSummary: refetch,
  };
};
