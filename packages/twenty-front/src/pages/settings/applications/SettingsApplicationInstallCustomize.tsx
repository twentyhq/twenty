import { SettingsApplicationGrantRestrictionsBanner } from '@/settings/applications/grant/components/SettingsApplicationGrantRestrictionsBanner';
import { SettingsApplicationInstallGrantRoute } from '@/settings/applications/grant/components/SettingsApplicationInstallGrantRoute';
import { ApplicationGrantEditorContext } from '@/settings/applications/grant/contexts/ApplicationGrantEditorContext';
import { getApplicationInstallPath } from '@/settings/applications/grant/utils/getApplicationInstallPath';
import { hasGrantRestrictions } from '@/settings/applications/grant/utils/hasGrantRestrictions';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsRolePermissionsObjectLevelSection } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelSection';
import { SettingsRolePermissionsObjectsSection } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsObjectsSection';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { NavigationButton } from '@/ui/input/components/NavigationButton';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const SettingsApplicationInstallCustomizeContent = ({
  universalIdentifier,
  draftRoleId,
}: {
  universalIdentifier: string;
  draftRoleId: string;
}) => {
  const applicationGrantEditor = useContext(ApplicationGrantEditorContext);
  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    draftRoleId,
  );

  return (
    <SettingsPageLayout
      title={applicationGrantEditor?.applicationName ?? ''}
      titleColor={themeCssVariables.font.color.tertiary}
      links={applicationGrantEditor?.editorBreadcrumbLinks ?? []}
      actionButton={
        <NavigationButton
          size="sm"
          variant="solid"
          color="accent"
          to={getApplicationInstallPath(universalIdentifier)}
        >{t`Done`}</NavigationButton>
      }
    >
      <SettingsPageContainer>
        {hasGrantRestrictions(settingsDraftRole) && (
          <SettingsApplicationGrantRestrictionsBanner />
        )}
        <SettingsRolePermissionsObjectsSection
          roleId={draftRoleId}
          isEditable
        />
        <SettingsRolePermissionsObjectLevelSection
          roleId={draftRoleId}
          isEditable
        />
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};

export const SettingsApplicationInstallCustomize = () => {
  const { availableApplicationId } = useParams();

  if (!isDefined(availableApplicationId)) {
    return <Navigate to={getSettingsPath(SettingsPath.Applications)} />;
  }

  return (
    <SettingsApplicationInstallGrantRoute
      universalIdentifier={availableApplicationId}
    >
      {({ draftRoleId }) => (
        <SettingsApplicationInstallCustomizeContent
          universalIdentifier={availableApplicationId}
          draftRoleId={draftRoleId}
        />
      )}
    </SettingsApplicationInstallGrantRoute>
  );
};
