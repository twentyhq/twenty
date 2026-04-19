/* @license Enterprise */

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import SettingsSsoIdentitiesProvidersForm from '@/settings/security/components/Sso/SettingsSsoIdentitiesProvidersForm';
import { useCreateSsoIdentityProvider } from '@/settings/security/hooks/useCreateSsoIdentityProvider';
import { type SettingSecurityNewSsoIdentityFormValues } from '@/settings/security/types/SsoIdentityProvider';
import { SsoIdentityProviderDefaultValues } from '@/settings/security/utils/SsoIdentityProviderDefaultValues';
import { SsoIdentitiesProvidersParamsSchema } from '@/settings/security/validation-schemas/SsoIdentityProviderSchema';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { FormProvider, useForm } from 'react-hook-form';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const SettingsSecuritySsoIdentifyProvider = () => {
  const navigate = useNavigateSettings();

  const { enqueueErrorSnackBar } = useSnackBar();
  const { createSsoIdentityProvider } = useCreateSsoIdentityProvider();

  const form = useForm<SettingSecurityNewSsoIdentityFormValues>({
    mode: 'onSubmit',
    resolver: zodResolver(SsoIdentitiesProvidersParamsSchema),
    defaultValues: Object.values(SsoIdentityProviderDefaultValues).reduce(
      (acc, fn) => ({ ...acc, ...fn() }),
      {},
    ),
  });

  const handleSave = async () => {
    try {
      const type = form.getValues('type');

      const values = form.getValues();
      const providerKeys = Object.keys(
        SsoIdentityProviderDefaultValues[type](),
      );

      const filteredValues = Object.fromEntries(
        Object.entries(values).filter(([key]) => providerKeys.includes(key)),
      );

      await createSsoIdentityProvider(
        SsoIdentitiesProvidersParamsSchema.parse(filteredValues),
      );

      navigate(SettingsPath.Security);
    } catch (error) {
      enqueueErrorSnackBar({
        apolloError: CombinedGraphQLErrors.is(error) ? error : undefined,
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSave)}>
      <FormProvider
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...form}
      >
        <SubMenuTopBarContainer
          title={t`New Sso Configuration`}
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
            { children: <Trans>New Sso provider</Trans> },
          ]}
        >
          <SettingsSsoIdentitiesProvidersForm />
        </SubMenuTopBarContainer>
      </FormProvider>
    </form>
  );
};
