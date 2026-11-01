import { AuthorizeActionButtons } from '@/applications/components/AuthorizeActionButtons';
import { SettingsApplicationRequiredAccessCard } from '@/marketplace/components/SettingsApplicationRequiredAccessCard';
import { useInstallMarketplaceApp } from '@/marketplace/hooks/useInstallMarketplaceApp';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { SettingsApplicationGrantRestrictionsBanner } from '@/settings/applications/grant/components/SettingsApplicationGrantRestrictionsBanner';
import {
  type SettingsApplicationInstallGrant,
  SettingsApplicationInstallGrantRoute,
} from '@/settings/applications/grant/components/SettingsApplicationInstallGrantRoute';
import { fromInstallGrantDraftRoleToRoleManifest } from '@/settings/applications/grant/utils/fromInstallGrantDraftRoleToRoleManifest';
import { getApplicationInstallCustomizePath } from '@/settings/applications/grant/utils/getApplicationInstallPath';
import { hasGrantRestrictions } from '@/settings/applications/grant/utils/hasGrantRestrictions';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { SettingsRolePermissionsObjectLevelSection } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelSection';
import { SettingsRolePermissionsObjectsSection } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsObjectsSection';
import { getRoleDirtyFields } from '@/settings/roles/role/utils/getRoleDirtyFields';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { IconAlertTriangle, IconPencil, IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const StyledAccessActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledHint = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const SettingsApplicationInstallContent = ({
  universalIdentifier,
  installGrant: {
    draftRoleId,
    detail,
    requestedRoleManifest,
    requestedGrantRole,
  },
}: {
  universalIdentifier: string;
  installGrant: SettingsApplicationInstallGrant;
}) => {
  const navigate = useNavigate();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { install, isInstalling } = useInstallMarketplaceApp({
    universalIdentifier,
  });
  const canEditRoles = useHasPermissionFlag(PermissionFlagType.ROLES);

  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    draftRoleId,
  );
  const setSettingsDraftRole = useSetAtomFamilyState(
    settingsDraftRoleFamilyState,
    draftRoleId,
  );

  const isCustomized =
    Object.keys(getRoleDirtyFields(settingsDraftRole, requestedGrantRole))
      .length > 0;

  const detailPath = getSettingsPath(SettingsPath.AvailableApplicationDetail, {
    availableApplicationId: universalIdentifier,
  });

  const handleAuthorize = async () => {
    const isInstallTriggered = await install(
      isCustomized
        ? fromInstallGrantDraftRoleToRoleManifest({
            draftRole: settingsDraftRole,
            requestedRoleManifest,
            objectMetadataItems,
          })
        : undefined,
    );

    if (isInstallTriggered) {
      setSettingsDraftRole(requestedGrantRole);
      navigate(detailPath);
    }
  };

  return (
    <SettingsPageLayout
      title={t`Install ${detail.name}`}
      links={[
        { children: t`Workspace`, href: getSettingsPath(SettingsPath.General) },
        { children: t`Apps`, href: getSettingsPath(SettingsPath.Applications) },
        { children: detail.name, href: detailPath },
        { children: t`Install` },
      ]}
    >
      <SettingsPageContainer>
        {!detail.isListed && (
          <InlineBanner
            status="warning"
            icon={<IconAlertTriangle aria-hidden="true" />}
          >{t`This application is not listed on the marketplace and has not been reviewed by Twenty. Use at your own risk.`}</InlineBanner>
        )}
        <SettingsApplicationRequiredAccessCard
          appDisplayName={detail.name}
          defaultRole={requestedRoleManifest}
          appObjects={detail.objects ?? undefined}
          requestedCapabilities={detail.requestedCapabilities}
          billsCredits={detail.billsCredits}
          showsRecordAccess={false}
        />
        <Section.Root>
          <Section.Header
            title={t`Access to your data`}
            description={
              isCustomized
                ? t`Customized. The app gets the access below.`
                : t`What the app asks for. Authorize as is to grant exactly this.`
            }
            actions={
              <StyledAccessActions>
                {isCustomized && (
                  <Button
                    startIcon={<IconRefresh />}
                    variant="outline"
                    size="sm"
                    onClick={() => setSettingsDraftRole(requestedGrantRole)}
                  >{t`Reset`}</Button>
                )}
                {canEditRoles && (
                  <Button
                    startIcon={<IconPencil />}
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      navigate(
                        getApplicationInstallCustomizePath(universalIdentifier),
                      )
                    }
                  >{t`Customize`}</Button>
                )}
              </StyledAccessActions>
            }
          />
        </Section.Root>
        {hasGrantRestrictions(settingsDraftRole) && (
          <SettingsApplicationGrantRestrictionsBanner />
        )}
        <SettingsRolePermissionsObjectsSection
          roleId={draftRoleId}
          isEditable={false}
        />
        <SettingsRolePermissionsObjectLevelSection
          roleId={draftRoleId}
          isEditable={false}
        />
        <StyledHint>
          {t`After install, admins can add objects, hide fields and filter records in the app's Access tab.`}
        </StyledHint>
        <AuthorizeActionButtons
          onCancel={() => navigate(detailPath)}
          onAuthorize={handleAuthorize}
          isLoading={isInstalling}
        />
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};

export const SettingsApplicationInstall = () => {
  const { availableApplicationId } = useParams();

  if (!isDefined(availableApplicationId)) {
    return <Navigate to={getSettingsPath(SettingsPath.Applications)} />;
  }

  return (
    <SettingsApplicationInstallGrantRoute
      universalIdentifier={availableApplicationId}
    >
      {(installGrant) => (
        <SettingsApplicationInstallContent
          universalIdentifier={availableApplicationId}
          installGrant={installGrant}
        />
      )}
    </SettingsApplicationInstallGrantRoute>
  );
};
