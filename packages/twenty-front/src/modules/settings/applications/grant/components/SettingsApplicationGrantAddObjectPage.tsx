import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsWizardStepBar } from '@/settings/components/layout/SettingsWizardStepBar';
import { ApplicationGrantEditorContext } from '@/settings/applications/grant/contexts/ApplicationGrantEditorContext';
import { SettingsRolePermissionsObjectLevelObjectPicker } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelObjectPicker';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

type SettingsApplicationGrantAddObjectPageProps = {
  grantRoleId: string;
};

export const SettingsApplicationGrantAddObjectPage = ({
  grantRoleId,
}: SettingsApplicationGrantAddObjectPageProps) => {
  const applicationGrantEditor = useContext(ApplicationGrantEditorContext);

  return (
    <SettingsPageLayout
      title={applicationGrantEditor?.applicationName ?? ''}
      titleColor={themeCssVariables.font.color.tertiary}
      links={[
        ...(applicationGrantEditor?.editorBreadcrumbLinks ?? []),
        { children: t`Add object` },
      ]}
      secondaryBar={<SettingsWizardStepBar label={t`1. Select an object`} />}
    >
      <SettingsPageContainer>
        <SettingsRolePermissionsObjectLevelObjectPicker roleId={grantRoleId} />
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
