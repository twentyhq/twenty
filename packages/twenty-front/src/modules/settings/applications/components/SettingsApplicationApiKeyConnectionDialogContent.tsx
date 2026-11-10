import { useMutation } from '@apollo/client/react';
import { isErrorLike } from '@apollo/client/errors';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type FormEvent, useState } from 'react';
import { Button } from 'twenty-ui/primitives/input';
import { Dialog, type DialogPopupProps } from 'twenty-ui/primitives/surfaces';

import { GET_MY_CONNECTED_ACCOUNTS } from '@/settings/accounts/graphql/queries/getMyConnectedAccounts';
import { type ConnectableApplicationConnectionProvider } from '@/settings/applications/types/ConnectableApplicationConnectionProvider';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import {
  ApplicationConnectedAccountsDocument,
  ConnectApplicationWithApiKeyDocument,
} from '~/generated-metadata/graphql';
import { getErrorMessageFromApolloError } from '~/utils/get-error-message-from-apollo-error.util';

type SettingsApplicationApiKeyConnectionDialogContentProps = {
  dialogId: string;
  onKeyDown: DialogPopupProps['onKeyDown'];
  applicationId: string;
  connectionProvider: ConnectableApplicationConnectionProvider;
  reconnectingConnectedAccountId?: string;
};

export const SettingsApplicationApiKeyConnectionDialogContent = ({
  dialogId,
  onKeyDown,
  applicationId,
  connectionProvider,
  reconnectingConnectedAccountId,
}: SettingsApplicationApiKeyConnectionDialogContentProps) => {
  const { t } = useLingui();
  const providerDisplayName = connectionProvider.displayName;
  const { closeDialog } = useDialog();
  const [apiKey, setApiKey] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const trimmedApiKey = apiKey.trim();

  const [connectApplicationWithApiKey, { loading }] = useMutation(
    ConnectApplicationWithApiKeyDocument,
    {
      refetchQueries: [
        { query: GET_MY_CONNECTED_ACCOUNTS },
        {
          query: ApplicationConnectedAccountsDocument,
          variables: { applicationId },
        },
      ],
      awaitRefetchQueries: true,
    },
  );

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();

    if (!isNonEmptyString(trimmedApiKey) || loading) {
      return;
    }

    try {
      await connectApplicationWithApiKey({
        variables: {
          input: {
            applicationId,
            providerName: connectionProvider.name,
            apiKey: trimmedApiKey,
            reconnectingConnectedAccountId,
          },
        },
      });
      closeDialog(dialogId);
    } catch (error) {
      setErrorMessage(
        isErrorLike(error)
          ? getErrorMessageFromApolloError(error)
          : t`An error occurred.`,
      );
    }
  };

  return (
    <Dialog.Popup
      onKeyDown={onKeyDown}
      data-globally-prevent-click-outside
      size="sm"
    >
      <Dialog.Header>
        <Dialog.Title>{t`Connect ${providerDisplayName}`}</Dialog.Title>
        <Dialog.Description render={<div />}>
          {t`Paste your ${providerDisplayName} API key. It is stored encrypted and only used by this app.`}
        </Dialog.Description>
      </Dialog.Header>
      <Dialog.Body>
        <form onSubmit={handleSubmit}>
          <SettingsTextInput
            instanceId={`${dialogId}-api-key-input`}
            type="password"
            autoComplete="off"
            label={t`${providerDisplayName} API key`}
            value={apiKey}
            onChange={(value) => {
              setApiKey(value);
              setErrorMessage(undefined);
            }}
            error={errorMessage}
            fullWidth
            disableHotkeys
            autoFocusOnMount
          />
        </form>
      </Dialog.Body>
      <Dialog.Footer>
        <Button
          onClick={() => closeDialog(dialogId)}
          fullWidth
          variant="outline"
        >
          {t`Cancel`}
        </Button>
        <Button
          onClick={() => handleSubmit()}
          disabled={!isNonEmptyString(trimmedApiKey)}
          loading={loading}
          fullWidth
          variant="solid"
          color="accent"
        >
          {t`Connect`}
        </Button>
      </Dialog.Footer>
    </Dialog.Popup>
  );
};
