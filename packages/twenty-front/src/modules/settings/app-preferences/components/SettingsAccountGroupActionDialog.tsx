import { DELETE_CONNECTED_ACCOUNT } from '@/settings/accounts/graphql/mutations/deleteConnectedAccount';
import { DISCONNECT_CONNECTED_ACCOUNT } from '@/settings/accounts/graphql/mutations/disconnectConnectedAccount';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useToast } from 'twenty-ui/components/feedback';

export type AccountGroupAction = {
  action: 'disconnect' | 'delete';
  handle: string;
  targets: { id: string; label: string }[];
};

type SettingsAccountGroupActionDialogProps = {
  dialogId: string;
  accountGroupAction: AccountGroupAction;
  isPending: boolean;
  onPendingChange: (isPending: boolean) => void;
};

export const SettingsAccountGroupActionDialog = ({
  dialogId,
  accountGroupAction,
  isPending,
  onPendingChange,
}: SettingsAccountGroupActionDialogProps) => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const apolloClient = useApolloClient();
  const [deleteConnectedAccount] = useMutation(DELETE_CONNECTED_ACCOUNT);
  const [disconnectConnectedAccount] = useMutation(
    DISCONNECT_CONNECTED_ACCOUNT,
  );
  const { action, handle, targets } = accountGroupAction;

  const confirmAction = async () => {
    if (isPending) {
      return;
    }

    onPendingChange(true);

    try {
      const mutation =
        action === 'disconnect'
          ? disconnectConnectedAccount
          : deleteConnectedAccount;
      const results = await Promise.allSettled(
        targets.map(({ id }) => mutation({ variables: { id } })),
      );
      const failedTargets = targets.filter(
        (_, index) => results[index].status === 'rejected',
      );

      if (failedTargets.length > 0) {
        const failedConnectionLabels = failedTargets
          .map(({ label }) => label)
          .join(', ');
        const successfulCount = targets.length - failedTargets.length;
        const totalCount = targets.length;

        enqueueToast({
          status: 'error',
          children:
            action === 'disconnect'
              ? t`Disconnected ${successfulCount} of ${totalCount} connections. Could not disconnect: ${failedConnectionLabels}.`
              : t`Deleted ${successfulCount} of ${totalCount} connections. Could not delete: ${failedConnectionLabels}.`,
        });
      }

      try {
        await apolloClient.refetchQueries({ include: 'active' });
      } catch {
        enqueueToast({
          status: 'error',
          children: t`The account list could not be refreshed. Reload the page to check the current state.`,
        });
      }
    } finally {
      onPendingChange(false);
    }
  };

  return (
    <ConfirmationDialog
      dialogId={dialogId}
      loading={isPending}
      title={
        action === 'disconnect'
          ? t`Disconnect account`
          : t`Delete account and synced data?`
      }
      subtitle={
        <>
          {action === 'disconnect' ? (
            <Trans>
              Disconnect {handle} from the following apps and connections? Their
              access and syncing will stop. Synced emails and events will be
              retained.
            </Trans>
          ) : (
            <Trans>
              This permanently deletes {handle}, the following connections, and
              all emails and events synced through them. This action cannot be
              undone.
            </Trans>
          )}
          <ul>
            {targets.map(({ id, label }) => (
              <li key={id}>{label}</li>
            ))}
          </ul>
        </>
      }
      onConfirmClick={confirmAction}
      confirmButtonText={
        action === 'disconnect'
          ? t`Disconnect account`
          : t`Delete account and data`
      }
      shouldWaitForConfirmBeforeClosing
    />
  );
};
