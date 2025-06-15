import { FormProvider } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import { ImapConnectionForm } from '@/settings/accounts/components/ImapConnectionForm';
import { useConnectedAccount } from '@/settings/accounts/hooks/useConnectedAccount';
import { useImapConnectionForm } from '@/settings/accounts/hooks/useImapConnectionForm';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
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

  const {
    connectedAccount,
    loading: accountLoading,
    connectionParams,
  } = useConnectedAccount({
    connectedAccountId,
  });

  const initialData =
    connectionParams && isDefined(connectedAccount)
      ? {
          handle: connectedAccount?.handle || '',
          host: connectionParams.host,
          port: connectionParams.port,
          secure: connectionParams.secure,
        }
      : undefined;

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
          <ImapConnectionForm control={control} isEditing />
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </FormProvider>
  );

  if (accountLoading) {
    return renderLoadingState();
  }

  return renderForm();
};
