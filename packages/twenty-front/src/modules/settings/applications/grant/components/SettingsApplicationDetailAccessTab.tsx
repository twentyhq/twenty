import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { SettingsApplicationGrantPendingCard } from '@/settings/applications/grant/components/SettingsApplicationGrantPendingCard';
import { ApplicationGrantEditorContext } from '@/settings/applications/grant/contexts/ApplicationGrantEditorContext';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsRolesQueryEffect } from '@/settings/roles/components/SettingsRolesQueryEffect';
import { SettingsRolePermissionsObjectLevelSection } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelSection';
import { SettingsRolePermissionsObjectsSection } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsObjectsSection';
import { SettingsRolePermissionsSettingsSection } from '@/settings/roles/role-permissions/permission-flags/components/SettingsRolePermissionsSettingsSection';
import { SettingsRoleDraftSyncEffect } from '@/settings/roles/role/components/SettingsRoleDraftSyncEffect';
import { useSaveDraftRoleToDB } from '@/settings/roles/role/hooks/useSaveDraftRoleToDB';
import { getRoleDirtyFields } from '@/settings/roles/role/utils/getRoleDirtyFields';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { InlineBanner, useToast } from 'twenty-ui/components/feedback';
import { IconAlertTriangle } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import {
  GetApplicationGrantDocument,
  type GetApplicationGrantQuery,
} from '~/generated-metadata/graphql';

type SettingsApplicationDetailAccessTabProps = {
  applicationId: string;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[8]};
`;

const StyledActions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const StyledIntro = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
`;

type ApplicationGrant = GetApplicationGrantQuery['applicationGrant'];

const SettingsApplicationGrantEditor = ({
  applicationId,
  applicationGrant,
  grantRoleId,
}: {
  applicationId: string;
  applicationGrant: ApplicationGrant;
  grantRoleId: string;
}) => {
  const { enqueueToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    grantRoleId,
  );
  const setSettingsDraftRole = useSetAtomFamilyState(
    settingsDraftRoleFamilyState,
    grantRoleId,
  );
  const settingsPersistedRole = useAtomFamilyStateValue(
    settingsPersistedRoleFamilyState,
    grantRoleId,
  );

  const { saveDraftRoleToDB } = useSaveDraftRoleToDB({
    roleId: grantRoleId,
    isCreateMode: false,
    grantedApplicationId: applicationId,
  });

  const isDirty =
    Object.keys(getRoleDirtyFields(settingsDraftRole, settingsPersistedRole))
      .length > 0;

  const hasRestrictions =
    (settingsPersistedRole?.fieldPermissions ?? []).some(
      (fieldPermission) =>
        fieldPermission.canReadFieldValue === false ||
        fieldPermission.canUpdateFieldValue === false,
    ) || (settingsPersistedRole?.rowLevelPermissionPredicates ?? []).length > 0;

  const editorContextValue = useMemo(
    () => ({
      applicationId,
      lockedObjectMetadataIds: new Set(
        applicationGrant.lockedObjectPermissions.map(
          (lockedObjectPermission) => lockedObjectPermission.objectMetadataId,
        ),
      ),
    }),
    [applicationId, applicationGrant.lockedObjectPermissions],
  );

  const handleSave = async () => {
    setIsSaving(true);

    try {
      await saveDraftRoleToDB();
      enqueueToast({ status: 'success', children: t`Access saved` });
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isDefined(settingsPersistedRole)) {
      setSettingsDraftRole(settingsPersistedRole);
    }
  };

  return (
    <ApplicationGrantEditorContext.Provider value={editorContextValue}>
      <SettingsRoleDraftSyncEffect roleId={grantRoleId} />
      {isDirty && (
        <StyledActions>
          <SaveAndCancelButtons
            onSave={handleSave}
            onCancel={handleCancel}
            isLoading={isSaving}
          />
        </StyledActions>
      )}
      {hasRestrictions && (
        <InlineBanner
          status="warning"
          icon={<IconAlertTriangle aria-hidden="true" />}
        >{t`Some fields or records are hidden from this app. Some of its features may stop working.`}</InlineBanner>
      )}
      <SettingsRolePermissionsObjectsSection roleId={grantRoleId} isEditable />
      <SettingsRolePermissionsObjectLevelSection
        roleId={grantRoleId}
        isEditable
      />
      <SettingsRolePermissionsSettingsSection
        roleId={grantRoleId}
        isEditable={false}
      />
    </ApplicationGrantEditorContext.Provider>
  );
};

export const SettingsApplicationDetailAccessTab = ({
  applicationId,
}: SettingsApplicationDetailAccessTabProps) => {
  const { data, loading } = useQuery(GetApplicationGrantDocument, {
    variables: { applicationId },
    fetchPolicy: 'network-only',
  });

  const applicationGrant = data?.applicationGrant;
  const grantRoleId = applicationGrant?.grantRoleId;

  const settingsPersistedRole = useAtomFamilyStateValue(
    settingsPersistedRoleFamilyState,
    grantRoleId ?? '',
  );

  if (loading && !isDefined(applicationGrant)) {
    return <SettingsSectionSkeletonLoader />;
  }

  if (!isDefined(applicationGrant) || !isDefined(grantRoleId)) {
    return (
      <StyledIntro>{t`This app has no granted role, so it has no access to your data.`}</StyledIntro>
    );
  }

  return (
    <StyledContainer>
      <SettingsRolesQueryEffect />
      <SettingsApplicationGrantPendingCard
        applicationId={applicationId}
        applicationGrant={applicationGrant}
      />
      <StyledIntro>
        {t`The app runs with this role. Locked objects are required by the app; you can add objects, hide fields and filter records.`}
      </StyledIntro>
      {isDefined(settingsPersistedRole) ? (
        <SettingsApplicationGrantEditor
          applicationId={applicationId}
          applicationGrant={applicationGrant}
          grantRoleId={grantRoleId}
        />
      ) : (
        <SettingsSectionSkeletonLoader />
      )}
    </StyledContainer>
  );
};
