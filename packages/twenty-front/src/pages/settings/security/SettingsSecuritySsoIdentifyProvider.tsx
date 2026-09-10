/* @license Enterprise */

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import SettingsSsoIdentitiesProvidersForm from '@/settings/security/components/sso/SettingsSsoIdentitiesProvidersForm';
import { useCreateSsoIdentityProvider } from '@/settings/security/hooks/useCreateSsoIdentityProvider';
import { type SettingSecurityNewSsoIdentityFormValues } from '@/settings/security/types/SsoIdentityProvider';
import { ssoIdentityProviderDefaultValues } from '@/settings/security/utils/ssoIdentityProviderDefaultValues';
import { ssoIdentitiesProvidersParamsSchema } from '@/settings/security/validation-schemas/ssoIdentityProviderSchema';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { FormProvider, useForm } from 'react-hook-form';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/feedback';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const SettingsSecuritySsoIdentifyProvider = () => {
  const navigate = useNavigateSettings();

  const { enqueueToast } = useToast();
  const { createSsoIdentityProvider } = useCreateSsoIdentityProvider();

  const form = useForm<SettingSecurityNewSsoIdentityFormValues>({
    mode: 'onSubmit',
    resolver: zodResolver(ssoIdentitiesProvidersParamsSchema),
    defaultValues: Object.values(ssoIdentityProviderDefaultValues).reduce(
      (acc, fn) => ({ ...acc, ...fn() }),
      {},
    ),
  });

  const handleSave = async () => {
    try {
      const type = form.getValues('type');

      const values = form.getValues();
      const providerKeys = Object.keys(
        ssoIdentityProviderDefaultValues[type](),
      );

      const filteredValues = Object.fromEntries(
        Object.entries(values).filter(([key]) => providerKeys.includes(key)),
      );

      await createSsoIdentityProvider(
        ssoIdentitiesProvidersParamsSchema.parse(filteredValues),
      );

      navigate(SettingsPath.Security);
    } catch (error) {
      enqueueToast(
        getToastOptionsFromError({
          error: CombinedGraphQLErrors.is(error) ? error : undefined,
        }),
      );
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSave)}>
      <FormProvider
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...form}
      >
        <SettingsPageLayout
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
              href: getSettingsPath(SettingsPath.General),
            },
            {
              children: <Trans>Security</Trans>,
              href: getSettingsPath(SettingsPath.Security),
            },
            { children: <Trans>New SSO provider</Trans> },
          ]}
        >
          <SettingsSsoIdentitiesProvidersForm />
        </SettingsPageLayout>
      </FormProvider>
    </form>
  );
};
