import { FormProvider } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import { SetttingsAccountsImapConnectionForm } from '@/settings/accounts/components/SetttingsAccountsImapConnectionForm';
import { useConnectedImapSmtpCaldavAccount } from '@/settings/accounts/hooks/useConnectedImapSmtpCaldavAccount';
import { useImapConnectionForm } from '@/settings/accounts/hooks/useImapConnectionForm';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { Loader } from 'twenty-ui/feedback';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledLoadingContainer = styled.div`
  align-items: center;
  display: flex;
  height: 200px;
  justify-content: center;
  width: 100%;
`;

export const SettingsAccountsEditImapConnection = () => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const { connectedAccountId } = useParams<{ connectedAccountId: string }>();

  const { connectedAccount, loading: accountLoading } =
    useConnectedImapSmtpCaldavAccount(connectedAccountId);

  const initialData = {
    handle: connectedAccount?.handle || '',
    host: connectedAccount?.connectionParameters?.IMAP?.host || '',
    port: connectedAccount?.connectionParameters?.IMAP?.port || 993,
    secure: connectedAccount?.connectionParameters?.IMAP?.secure ?? true,
    password: connectedAccount?.connectionParameters?.IMAP?.password || '',
  };

  const { formMethods, handleSave, handleSubmit, canSave, isSubmitting } =
    useImapConnectionForm({
      initialData,
      isEditing: true,
      connectedAccountId,
    });

  const { control } = formMethods;

  const renderLoadingState = () => (
    <StyledLoadingContainer>
      <Loader />
    </StyledLoadingContainer>
  );

  const renderForm = () => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formMethods}>
      <SubMenuTopBarContainer
        title={t`Edit IMAP Connection`}
        links={[
          {
            children: t`Settings`,
            href: getSettingsPath(SettingsPath.Workspace),
          },
          {
            children: t`Email Connections`,
            href: getSettingsPath(SettingsPath.Accounts),
          },
          { children: t`Edit IMAP Connection` },
        ]}
        actionButton={
          <SaveAndCancelButtons
            isSaveDisabled={!canSave}
            isCancelDisabled={isSubmitting}
            onCancel={() => navigate(SettingsPath.Accounts)}
            onSave={handleSubmit(handleSave)}
          />
        }
      >
        <SettingsPageContainer>
          <SetttingsAccountsImapConnectionForm control={control} isEditing />
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </FormProvider>
  );

  if (accountLoading === true) {
    return renderLoadingState();
  }

  return renderForm();
};
