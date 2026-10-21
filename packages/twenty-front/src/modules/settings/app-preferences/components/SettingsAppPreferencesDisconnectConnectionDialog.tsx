import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { DELETE_CONNECTED_ACCOUNT } from '@/settings/accounts/graphql/mutations/deleteConnectedAccount';
import { GET_MY_CONNECTED_ACCOUNTS } from '@/settings/accounts/graphql/queries/getMyConnectedAccounts';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useMutation } from '@apollo/client/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useToast } from 'twenty-ui/components/feedback';
import { MyApplicationPreferencesDocument } from '~/generated-metadata/graphql';

type SettingsAppPreferencesDisconnectConnectionDialogProps = {
  dialogId: string;
  connectedAccountId: string;
  connectionLabel: string;
};

export const SettingsAppPreferencesDisconnectConnectionDialog = ({
  dialogId,
  connectedAccountId,
  connectionLabel,
}: SettingsAppPreferencesDisconnectConnectionDialogProps) => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const [deleteConnectedAccount] = useMutation(DELETE_CONNECTED_ACCOUNT, {
    refetchQueries: [
      { query: GET_MY_CONNECTED_ACCOUNTS },
      { query: MyApplicationPreferencesDocument },
    ],
    awaitRefetchQueries: true,
  });

  return (
    <ConfirmationDialog
      dialogId={dialogId}
      title={t`Disconnect connection?`}
      subtitle={
        <Trans>
          This will disconnect {connectionLabel} from this application.
        </Trans>
      }
      onConfirmClick={async () => {
        try {
          await deleteConnectedAccount({
            variables: { id: connectedAccountId },
          });
        } catch (error) {
          enqueueToast(getToastOptionsFromError({ error }));
        }
      }}
      confirmButtonText={t`Disconnect`}
      shouldWaitForConfirmBeforeClosing
    />
  );
};
