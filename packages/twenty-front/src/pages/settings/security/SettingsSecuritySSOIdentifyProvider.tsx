/* @license Enterprise */

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import SettingsSSOIdentitiesProvidersForm from '@/settings/security/components/SettingsSSOIdentitiesProvidersForm';
import { useCreateSSOIdentityProvider } from '@/settings/security/hooks/useCreateSSOIdentityProvider';
import { SettingSecurityNewSSOIdentityFormValues } from '@/settings/security/types/SSOIdentityProvider';
import { sSOIdentityProviderDefaultValues } from '@/settings/security/utils/sSOIdentityProviderDefaultValues';
import { SSOIdentitiesProvidersParamsSchema } from '@/settings/security/validation-schemas/SSOIdentityProviderSchema';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { zodResolver } from '@hookform/resolvers/zod';
import pick from 'lodash.pick';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsSecuritySSOIdentifyProvider = () => {
  const navigate = useNavigateSettings();

  const { enqueueSnackBar } = useSnackBar();
  const { createSSOIdentityProvider } = useCreateSSOIdentityProvider();

  const formConfig = useForm<SettingSecurityNewSSOIdentityFormValues>({
    mode: 'onChange',
    resolver: zodResolver(SSOIdentitiesProvidersParamsSchema),
    defaultValues: Object.values(sSOIdentityProviderDefaultValues).reduce(
      (acc, fn) => ({ ...acc, ...fn() }),
      {},
    ),
  });

  const handleSave = async () => {
    try {
      const type = formConfig.getValues('type');

      await createSSOIdentityProvider(
        SSOIdentitiesProvidersParamsSchema.parse(
          pick(
            formConfig.getValues(),
            Object.keys(sSOIdentityProviderDefaultValues[type]()),
          ),
        ),
      );

      navigate(SettingsPath.Security);
    } catch (error) {
      enqueueSnackBar((error as Error).message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return (
    <SubMenuTopBarContainer
      title="New SSO Configuration"
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!formConfig.formState.isValid}
          onCancel={() => navigate(SettingsPath.Security)}
          onSave={handleSave}
        />
      }
      links={[
        {
          children: 'Workspace',
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: 'Security',
          href: getSettingsPath(SettingsPath.Security),
        },
        { children: 'New' },
      ]}
    >
      <FormProvider
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...formConfig}
      >
        <SettingsSSOIdentitiesProvidersForm />
      </FormProvider>
    </SubMenuTopBarContainer>
  );
};
