import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { DELETE_CONNECTED_ACCOUNT } from '@/settings/accounts/graphql/mutations/deleteConnectedAccount';
import { GET_MY_CONNECTED_ACCOUNTS } from '@/settings/accounts/graphql/queries/getMyConnectedAccounts';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useMutation } from '@apollo/client/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { useToast } from 'twenty-ui/components/feedback';

type SettingsAppPreferencesRemoveConnectionDialogProps = {
  dialogId: string;
  connectedAccountId: string;
  connectionLabel: ReactNode;
};

export const SettingsAppPreferencesRemoveConnectionDialog = ({
  dialogId,
  connectedAccountId,
  connectionLabel,
}: SettingsAppPreferencesRemoveConnectionDialogProps) => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const [deleteConnectedAccount] = useMutation(DELETE_CONNECTED_ACCOUNT, {
    refetchQueries: [{ query: GET_MY_CONNECTED_ACCOUNTS }],
    awaitRefetchQueries: true,
  });

  return (
    <ConfirmationDialog
      dialogId={dialogId}
      title={t`Remove connection?`}
      subtitle={
        <Trans>
          This permanently removes {connectionLabel}. The app loses access to
          it.
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
      confirmButtonText={t`Remove`}
      shouldWaitForConfirmBeforeClosing
    />
  );
};
