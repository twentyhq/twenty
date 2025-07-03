/* @license Enterprise */

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import SettingsSSOIdentitiesProvidersForm from '@/settings/security/components/SSO/SettingsSSOIdentitiesProvidersForm';
import { useCreateSSOIdentityProvider } from '@/settings/security/hooks/useCreateSSOIdentityProvider';
import { SettingSecurityNewSSOIdentityFormValues } from '@/settings/security/types/SSOIdentityProvider';
import { sSOIdentityProviderDefaultValues } from '@/settings/security/utils/sSOIdentityProviderDefaultValues';
import { SSOIdentitiesProvidersParamsSchema } from '@/settings/security/validation-schemas/SSOIdentityProviderSchema';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { ApolloError } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import pick from 'lodash.pick';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

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

      await createSSOIdentityProvider(
        SSOIdentitiesProvidersParamsSchema.parse(
          pick(
            form.getValues(),
            Object.keys(sSOIdentityProviderDefaultValues[type]()),
          ),
        ),
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
