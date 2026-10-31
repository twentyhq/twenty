import { useInstalledApplications } from '@/applications/hooks/useInstalledApplications';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsWizardStepBar } from '@/settings/components/layout/SettingsWizardStepBar';
import { SettingsApplicationGrantRoute } from '@/settings/applications/grant/components/SettingsApplicationGrantRoute';
import { getApplicationAccessTabPath } from '@/settings/applications/grant/utils/getApplicationAccessPath';
import { SettingsRolePermissionsObjectLevelObjectPicker } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelObjectPicker';
import { t } from '@lingui/core/macro';
import { Navigate, useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

export const SettingsApplicationAccessAddObject = () => {
  const { applicationId } = useParams();
  const installedApplications = useInstalledApplications();

  if (!isDefined(applicationId)) {
    return <Navigate to={getSettingsPath(SettingsPath.Applications)} />;
  }

  const applicationName =
    installedApplications.find(({ id }) => id === applicationId)?.name ?? '';

  return (
    <SettingsApplicationGrantRoute applicationId={applicationId}>
      {(grantRoleId) => (
        <SettingsPageLayout
          title={applicationName}
          titleColor={themeCssVariables.font.color.tertiary}
          links={[
            {
              children: t`Workspace`,
              href: getSettingsPath(SettingsPath.General),
            },
            {
              children: t`Apps`,
              href: getSettingsPath(SettingsPath.Applications),
            },
            {
              children: applicationName,
              href: getSettingsPath(SettingsPath.ApplicationDetail, {
                applicationId,
              }),
            },
            {
              children: t`Access`,
              href: getApplicationAccessTabPath(applicationId),
            },
            { children: t`Add object` },
          ]}
          secondaryBar={
            <SettingsWizardStepBar label={t`1. Select an object`} />
          }
        >
          <SettingsPageContainer>
            <SettingsRolePermissionsObjectLevelObjectPicker
              roleId={grantRoleId}
            />
          </SettingsPageContainer>
        </SettingsPageLayout>
      )}
    </SettingsApplicationGrantRoute>
  );
};
