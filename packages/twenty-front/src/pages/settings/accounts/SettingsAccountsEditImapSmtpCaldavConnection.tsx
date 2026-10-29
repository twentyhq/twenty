import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { FormProvider } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { useResolveAccountsSettingsPath } from '@/settings/app-preferences/hooks/useResolveAccountsSettingsPath';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { SettingsPath } from 'twenty-shared/types';

import { Loader } from 'twenty-ui/primitives/feedback';

import { getSettingsPath } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

import { ACCOUNT_TYPES } from 'twenty-shared/constants';
import { NotFound } from '~/pages/not-found/NotFound';
import { useImapSmtpCaldavConnectionForm } from '@/settings/accounts/hooks/useImapSmtpCaldavConnectionForm';
import { SettingsAccountsConnectionForm } from '@/settings/accounts/components/SettingsAccountsConnectionForm';

const StyledLoadingContainer = styled.div`
  align-items: center;
  display: flex;
  height: 200px;
  justify-content: center;
`;

export const SettingsAccountsEditImapSmtpCaldavConnection = () => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const isAppPreferencesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
  );
  const { resolveAccountsSettingsPath } = useResolveAccountsSettingsPath();
  const { connectedAccountId } = useParams<{ connectedAccountId: string }>();

  const {
    formMethods,
    handleSave,
    handleSubmit,
    canSave,
    isSubmitting,
    loading,
    connectedAccount,
  } = useImapSmtpCaldavConnectionForm({
    isEditing: true,
    connectedAccountId,
  });

  const { control } = formMethods;

  if (loading && !connectedAccount) {
    return (
      <StyledLoadingContainer>
        <Loader />
      </StyledLoadingContainer>
    );
  }

  if (!connectedAccount && !loading) {
    return <NotFound />;
  }

  const existingProtocols = ACCOUNT_TYPES.filter(
    (protocol) => connectedAccount?.connectionParameters?.[protocol]?.host,
  );

  const renderForm = () => (
    // oxlint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formMethods}>
      <SettingsPageLayout
        title={t`Edit Account`}
        links={[
          {
            children: t`User`,
            href: getSettingsPath(SettingsPath.ProfilePage),
          },
          {
            children: isAppPreferencesEnabled
              ? t`Apps preferences`
              : t`Accounts`,
            href: getSettingsPath(
              resolveAccountsSettingsPath(SettingsPath.Accounts),
            ),
          },
          { children: t`Edit Account` },
        ]}
        actionButton={
          <SaveAndCancelButtons
            isSaveDisabled={!canSave}
            isCancelDisabled={isSubmitting}
            isLoading={loading}
            onCancel={() =>
              navigate(resolveAccountsSettingsPath(SettingsPath.Accounts))
            }
            onSave={handleSubmit((data) => handleSave(data))}
          />
        }
      >
        <SettingsPageContainer>
          <SettingsAccountsConnectionForm
            control={control}
            isEditing
            existingProtocols={existingProtocols}
          />
        </SettingsPageContainer>
      </SettingsPageLayout>
    </FormProvider>
  );

  return renderForm();
};
