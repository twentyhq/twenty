import { getMarketplaceAppDefaultRoleManifest } from '@/marketplace/utils/getMarketplaceAppDefaultRoleManifest';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { SettingsApplicationInstallGrantDraftEffect } from '@/settings/applications/grant/components/SettingsApplicationInstallGrantDraftEffect';
import { ApplicationGrantEditorContext } from '@/settings/applications/grant/contexts/ApplicationGrantEditorContext';
import { buildApplicationInstallEditorContextValue } from '@/settings/applications/grant/utils/buildApplicationInstallEditorContextValue';
import { buildInstallGrantDraftRole } from '@/settings/applications/grant/utils/buildInstallGrantDraftRole';
import { getInstallRequestedRoleManifest } from '@/settings/applications/grant/utils/getInstallRequestedRoleManifest';
import { getLockedActionsByObjectMetadataId } from '@/settings/applications/grant/utils/getLockedActionsByObjectMetadataId';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SettingsRoleDraftSyncEffect } from '@/settings/roles/role/components/SettingsRoleDraftSyncEffect';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useQuery } from '@apollo/client/react';
import { type ReactNode, useMemo } from 'react';
import {
  computeGrantLockedRequirement,
  type RoleManifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import {
  FindMarketplaceAppDetailDocument,
  type FindMarketplaceAppDetailQuery,
} from '~/generated-metadata/graphql';

export type SettingsApplicationInstallGrant = {
  draftRoleId: string;
  detail: FindMarketplaceAppDetailQuery['findMarketplaceAppDetail'];
  requestedRoleManifest: RoleManifest;
  requestedGrantRole: RoleWithPartialMembers;
};

type SettingsApplicationInstallGrantRouteProps = {
  universalIdentifier: string;
  children: (installGrant: SettingsApplicationInstallGrant) => ReactNode;
};

export const getApplicationInstallDraftRoleId = (universalIdentifier: string) =>
  `application-install-${universalIdentifier}`;

// The install pages edit a draft grant kept in the front, keyed by the app registration
export const SettingsApplicationInstallGrantRoute = ({
  universalIdentifier,
  children,
}: SettingsApplicationInstallGrantRouteProps) => {
  const { data } = useQuery(FindMarketplaceAppDetailDocument, {
    variables: { universalIdentifier },
  });
  const { objectMetadataItems } = useObjectMetadataItems();

  const detail = data?.findMarketplaceAppDetail;
  const draftRoleId = getApplicationInstallDraftRoleId(universalIdentifier);
  const applicationName = detail?.name ?? '';

  const requestedRoleManifest = useMemo(
    () =>
      getInstallRequestedRoleManifest({
        defaultRole: getMarketplaceAppDefaultRoleManifest(detail) ?? {
          universalIdentifier: 'no-requested-role',
          label: applicationName,
        },
        ownObjectUniversalIdentifiers: (detail?.objects ?? []).map(
          (object) => object.universalIdentifier,
        ),
      }),
    [detail, applicationName],
  );

  const requestedGrantRole = useMemo(
    () =>
      buildInstallGrantDraftRole({
        draftRoleId,
        applicationName,
        requestedRoleManifest,
        objectMetadataItems,
      }),
    [draftRoleId, applicationName, requestedRoleManifest, objectMetadataItems],
  );

  const editorContextValue = useMemo(() => {
    const objectMetadataIdByUniversalIdentifier = new Map(
      objectMetadataItems.map(({ id, universalIdentifier: objectId }) => [
        objectId,
        id,
      ]),
    );

    return buildApplicationInstallEditorContextValue({
      universalIdentifier,
      applicationName,
      lockedActionsByObjectMetadataId: getLockedActionsByObjectMetadataId(
        (
          computeGrantLockedRequirement(requestedRoleManifest)
            .objectPermissions ?? []
        ).flatMap(({ objectUniversalIdentifier, ...actions }) => {
          const objectMetadataId = objectMetadataIdByUniversalIdentifier.get(
            objectUniversalIdentifier,
          );

          return isDefined(objectMetadataId)
            ? [{ objectMetadataId, ...actions }]
            : [];
        }),
      ),
    });
  }, [
    universalIdentifier,
    applicationName,
    requestedRoleManifest,
    objectMetadataItems,
  ]);

  const settingsPersistedRole = useAtomFamilyStateValue(
    settingsPersistedRoleFamilyState,
    draftRoleId,
  );

  return (
    <ApplicationGrantEditorContext.Provider value={editorContextValue}>
      {isDefined(detail) && (
        <SettingsApplicationInstallGrantDraftEffect
          draftRoleId={draftRoleId}
          requestedGrantRole={requestedGrantRole}
        />
      )}
      <SettingsRoleDraftSyncEffect roleId={draftRoleId} />
      {isDefined(detail) && isDefined(settingsPersistedRole) ? (
        children({
          draftRoleId,
          detail,
          requestedRoleManifest,
          requestedGrantRole,
        })
      ) : (
        <SettingsSkeletonLoader />
      )}
    </ApplicationGrantEditorContext.Provider>
  );
};
