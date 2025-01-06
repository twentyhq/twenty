import { zodResolver } from '@hookform/resolvers/zod';
import pick from 'lodash.pick';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { H2Title, IconArchive } from 'twenty-ui';
import { z } from 'zod';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import {
  SettingsRoleAboutForm,
  SettingsRoleFormSchema,
} from '@/settings/roles/forms/SettingsRoleAboutForm';
import { useFindAllRoles } from '@/settings/roles/hooks/useFindAllRoles';
import { useUpdateRole } from '@/settings/roles/hooks/useUpdateRole';
import { Role } from '@/settings/roles/types/Role';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Button } from '@/ui/input/button/components/Button';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const editRoleFormSchema = z.object({}).merge(SettingsRoleFormSchema).extend({
  id: z.string(),
  workspaceId: z.string(),
});

type SettingsEditRoleSchemaValues = z.infer<typeof editRoleFormSchema>;

export const SettingsRoleEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackBar } = useSnackBar();

  const { roles } = useFindAllRoles();
  const { editRole } = useUpdateRole();
  const { toggleRoleActive } = useUpdateRole();

  const { roleSlug } = useParams<{ roleSlug?: string }>();

  const slug = roles.find((role) => role.name === roleSlug);
  const activeRole = slug;

  const settingsRolesPagePath = getSettingsPagePath(SettingsPath.MembersRoles);

  const formConfig = useForm<SettingsEditRoleSchemaValues>({
    mode: 'onTouched',
    resolver: zodResolver(editRoleFormSchema),
  });

  const { isValid, isSubmitting } = formConfig.formState;
  const canSave = isValid && !isSubmitting;

  const [selectedReportRole, setSelectedReportRole] = useState('');
  
  const onSave = async (formValues: SettingsEditRoleSchemaValues) => {
    const dirtyFieldsKeys = Object.keys(
      formConfig.formState.dirtyFields,
    ) as (keyof SettingsEditRoleSchemaValues)[];

    try {
      if (activeRole?.id) {
        const updatedValues = {
          ...pick(formValues, dirtyFieldsKeys),
          workspaceId: formValues.workspaceId,
          description: formValues.description || activeRole.description,
          canAccessWorkspaceSettings:
            formValues.canAccessWorkspaceSettings ??
            activeRole.canAccessWorkspaceSettings,
          icon: formValues.icon || activeRole.icon,
          permissions: formValues.permissions || activeRole.permissions,
          name: formValues.name || activeRole.name,
          reportsTo: selectedReportRole as unknown as Role
        };

        await editRole(formValues.id, updatedValues);

        navigate(settingsRolesPagePath);
      }
    } catch (err) {
      enqueueSnackBar((err as Error).message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

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

  return (
    <FormProvider {...formConfig}>
      <SubMenuTopBarContainer 
        links={[
          {
              children: 'Workspace',
              href: getSettingsPagePath(SettingsPath.Workspace),
          },
          {
            children: 'Roles',
            href: getSettingsPagePath(SettingsPath.MembersRoles),
          },
          ]} 
          title={t("editRole")}>
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
            <SaveAndCancelButtons
              isSaveDisabled={!canSave}
              isCancelDisabled={isSubmitting}
              onCancel={() => navigate(settingsRolesPagePath)}
              onSave={formConfig.handleSubmit(onSave)}
            />
          </SettingsHeaderContainer>
          <SettingsRoleAboutForm roleItem={activeRole} selectedReportRole={selectedReportRole} setSelectedReportRole={setSelectedReportRole}/>
          <Section>
            <H2Title title={t('dangerZone')} description={t('archiveRole')} />
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
