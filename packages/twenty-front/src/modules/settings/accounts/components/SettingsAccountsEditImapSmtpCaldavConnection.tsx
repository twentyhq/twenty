import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { FormProvider } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { SettingsPath } from 'twenty-shared/types';

import { Loader } from 'twenty-ui/feedback';

import { getSettingsPath } from 'twenty-shared/utils';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

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

  const renderForm = () => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formMethods}>
      <SubMenuTopBarContainer
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
          <SettingsAccountsConnectionForm control={control} isEditing />
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </FormProvider>
  );

  return renderForm();
};
