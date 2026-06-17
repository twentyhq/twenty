import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { FormProvider } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsPath } from 'twenty-shared/types';

import { Loader } from 'twenty-ui/feedback';

import { getSettingsPath } from 'twenty-shared/utils';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

import { ACCOUNT_TYPES } from 'twenty-shared/constants';
import { NotFound } from '~/pages/not-found/NotFound';
import { useImapSmtpCaldavConnectionForm } from '@/settings/accounts/hooks/useImapSmtpCaldavConnectionForm';
import { SettingsAccountsConnectionForm } from './SettingsAccountsConnectionForm';

const StyledLoadingContainer = styled.div`
  align-items: center;
  display: flex;
  height: 200px;
  justify-content: center;
`;

export const SettingsAccountsEditImapSmtpCaldavConnection = () => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
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
            children: t`Accounts`,
            href: getSettingsPath(SettingsPath.Accounts),
          },
          { children: t`Edit Account` },
        ]}
        actionButton={
          <SaveAndCancelButtons
            isSaveDisabled={!canSave}
            isCancelDisabled={isSubmitting}
            isLoading={loading}
            onCancel={() => navigate(SettingsPath.Accounts)}
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
