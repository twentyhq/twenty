import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { H2Title, IconArchive } from 'twenty-ui';

import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsRoleAboutForm } from '@/settings/roles/forms/SettingsRoleAboutForm';
import { useFindAllRoles } from '@/settings/roles/hooks/useFindAllRoles';
import { useUpdateRole } from '@/settings/roles/hooks/useUpdateRole';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Button } from '@/ui/input/button/components/Button';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { useTranslation } from 'react-i18next';

export const SettingsRoleView = () => {
  const navigate = useNavigate();
  const { enqueueSnackBar } = useSnackBar();
  const formMethods = useForm();

  const { roles } = useFindAllRoles();
  const { toggleRoleActive } = useUpdateRole();

  const { roleSlug } = useParams<{ roleSlug?: string }>();

  const slug = roles.find((role) => role.name === roleSlug);
  const activeRole = slug;

  const settingsRolesPagePath = getSettingsPagePath(SettingsPath.MembersRoles);

  const handleDisable = async () => {
    try {
      if (activeRole?.id) {
        await toggleRoleActive(activeRole.id);
        navigate(settingsRolesPagePath);
      }
    } catch (err) {
      enqueueSnackBar((err as Error).message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  const { t } = useTranslation();

  return (
    <FormProvider {...formMethods}>
      <SubMenuTopBarContainer 
        links={[
            {
                children: 'New',
                href: getSettingsPagePath(SettingsPath.NewRole),
            },
        ]}  
        title="Settings">
        <SettingsPageContainer>
          <SettingsHeaderContainer>
            <Breadcrumb
              links={[
                {
                  children: t('roles'),
                  href: `${settingsRolesPagePath}`,
                },
                { children: `${roleSlug}` },
              ]}
            />
          </SettingsHeaderContainer>
          <SettingsRoleAboutForm roleItem={activeRole} disabled={true} />
          <Section>
            <H2Title
              title={t('dangerZone')}
              description={t('deactivateRole')}
            />
            <Button
              Icon={IconArchive}
              title={t('archive')}
              size="small"
              onClick={handleDisable}
            />
          </Section>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </FormProvider>
  );
};
