import { useInstalledApplications } from '@/applications/hooks/useInstalledApplications';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { ApplicationGrantEditorContext } from '@/settings/applications/grant/contexts/ApplicationGrantEditorContext';
import { SettingsRoleRouteGuard } from '@/settings/roles/components/SettingsRoleRouteGuard';
import { SettingsRoleDraftSyncEffect } from '@/settings/roles/role/components/SettingsRoleDraftSyncEffect';
import { WorkspaceRouteUnavailable } from '@/ui/layout/page/components/WorkspaceRouteUnavailable';
import { useQuery } from '@apollo/client/react';
import { type ReactNode, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { GetApplicationGrantDocument } from '~/generated-metadata/graphql';

type SettingsApplicationGrantRouteProps = {
  applicationId: string;
  children: (grantRoleId: string) => ReactNode;
};

// Loads an app's grant and gives the role editor pages under the app its context
export const SettingsApplicationGrantRoute = ({
  applicationId,
  children,
}: SettingsApplicationGrantRouteProps) => {
  const { data, loading } = useQuery(GetApplicationGrantDocument, {
    variables: { applicationId },
  });
  const installedApplications = useInstalledApplications();

  const applicationGrant = data?.applicationGrant;
  const applicationName =
    installedApplications.find(({ id }) => id === applicationId)?.name ?? '';

  const editorContextValue = useMemo(
    () => ({
      applicationId,
      applicationName,
      lockedObjectMetadataIds: new Set(
        (applicationGrant?.lockedObjectPermissions ?? []).map(
          ({ objectMetadataId }) => objectMetadataId,
        ),
      ),
    }),
    [applicationId, applicationName, applicationGrant],
  );

  if (loading && !isDefined(applicationGrant)) {
    return <SettingsSkeletonLoader />;
  }

  const grantRoleId = applicationGrant?.grantRoleId;

  if (!isDefined(grantRoleId)) {
    return <WorkspaceRouteUnavailable />;
  }

  return (
    <ApplicationGrantEditorContext.Provider value={editorContextValue}>
      <SettingsRoleRouteGuard roleId={grantRoleId}>
        <SettingsRoleDraftSyncEffect roleId={grantRoleId} />
        {children(grantRoleId)}
      </SettingsRoleRouteGuard>
    </ApplicationGrantEditorContext.Provider>
  );
};
