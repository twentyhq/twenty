/* @license Enterprise */

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import SettingsSSOIdentitiesProvidersForm from '@/settings/security/components/SSO/SettingsSSOIdentitiesProvidersForm';
import { useCreateSSOIdentityProvider } from '@/settings/security/hooks/useCreateSSOIdentityProvider';
import { type SettingSecurityNewSSOIdentityFormValues } from '@/settings/security/types/SSOIdentityProvider';
import { sSOIdentityProviderDefaultValues } from '@/settings/security/utils/sSOIdentityProviderDefaultValues';
import { SSOIdentitiesProvidersParamsSchema } from '@/settings/security/validation-schemas/SSOIdentityProviderSchema';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { ApolloError } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { FormProvider, useForm } from 'react-hook-form';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const SettingsSecuritySSOIdentifyProvider = () => {
  const navigate = useNavigateSettings();

  const { enqueueErrorSnackBar } = useSnackBar();
  const { createSSOIdentityProvider } = useCreateSSOIdentityProvider();

  const form = useForm<SettingSecurityNewSSOIdentityFormValues>({
    mode: 'onSubmit',
    resolver: zodResolver(SSOIdentitiesProvidersParamsSchema),
    defaultValues: Object.values(sSOIdentityProviderDefaultValues).reduce(
      (acc, fn) => ({ ...acc, ...fn() }),
      {},
    ),
  });

  const handleSave = async () => {
    try {
      const type = form.getValues('type');

      const values = form.getValues();
      const providerKeys = Object.keys(
        sSOIdentityProviderDefaultValues[type](),
      );

      const filteredValues = Object.fromEntries(
        Object.entries(values).filter(([key]) => providerKeys.includes(key)),
      );

      await createSSOIdentityProvider(
        SSOIdentitiesProvidersParamsSchema.parse(filteredValues),
      );

      navigate(SettingsPath.Security);
    } catch (error) {
      enqueueErrorSnackBar({
        apolloError: error instanceof ApolloError ? error : undefined,
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSave)}>
      <FormProvider
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...form}
      >
        <SubMenuTopBarContainer
          title={t`New SSO Configuration`}
          actionButton={
            <SaveAndCancelButtons
              onCancel={() => navigate(SettingsPath.Security)}
              isSaveDisabled={form.formState.isSubmitting}
            />
          }
          links={[
            {
              children: <Trans>Workspace</Trans>,
              href: getSettingsPath(SettingsPath.Workspace),
            },
            {
              children: <Trans>Security</Trans>,
              href: getSettingsPath(SettingsPath.Security),
            },
            { children: <Trans>New SSO provider</Trans> },
          ]}
        >
          <SettingsSSOIdentitiesProvidersForm />
        </SubMenuTopBarContainer>
      </FormProvider>
    </form>
  );
};
