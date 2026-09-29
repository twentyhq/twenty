import { useAuth } from '@/auth/hooks/useAuth';
import { availableWorkspacesState } from '@/auth/states/availableWorkspacesState';
import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { countAvailableWorkspaces } from '@/auth/utils/availableWorkspacesUtils';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Section, useToast } from 'twenty-ui/components';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import {
  DeleteUserAccountDocument,
  DeleteUserWorkspaceDocument,
} from '~/generated-metadata/graphql';

const DELETE_ACCOUNT_MODAL_ID = 'delete-account-modal';
const LEAVE_WORKSPACE_MODAL_ID = 'leave-workspace-modal';

const StyledDangerActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

export const DeleteAccount = () => {
  const { t } = useLingui();
  const { openDialog } = useDialog();
  const { enqueueToast } = useToast();

  const [deleteUserAccount] = useMutation(DeleteUserAccountDocument);
  const [deleteUserFromWorkspace] = useMutation(DeleteUserWorkspaceDocument);
  const currentUser = useAtomStateValue(currentUserState);
  const userEmail = currentUser?.email;
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentWorkspaceMemberId = currentWorkspaceMember?.id;
  const { signOut } = useAuth();
  const availableWorkspaces = useAtomStateValue(availableWorkspacesState);
  const availableWorkspacesCount =
    countAvailableWorkspaces(availableWorkspaces);

  const userHasMultipleWorkspaces = availableWorkspacesCount > 1;

  const deleteAccount = async () => {
    await deleteUserAccount();
    await signOut();
  };

  const leaveWorkspace = async () => {
    if (!isDefined(currentWorkspaceMemberId)) {
      enqueueToast({
        variant: 'error',
        children: t`Current workspace member not found.`,
      });
      return;
    }

    await deleteUserFromWorkspace?.({
      variables: {
        workspaceMemberIdToDelete: currentWorkspaceMemberId,
      },
    });
    await signOut();
  };

  return (
    <>
      <Section.Header
        title={t`Danger zone`}
        description={
          userHasMultipleWorkspaces
            ? t`Delete account and all the associated data or leave workspace`
            : t`Delete account and all the associated data`
        }
      />
      <StyledDangerActions>
        {userHasMultipleWorkspaces && (
          <Button
            onClick={() => openDialog(LEAVE_WORKSPACE_MODAL_ID)}
            variant="outline"
            color="danger"
          >{t`Leave workspace`}</Button>
        )}
        <Button
          onClick={() => openDialog(DELETE_ACCOUNT_MODAL_ID)}
          variant="outline"
          color="danger"
        >{t`Delete account`}</Button>
      </StyledDangerActions>
      {userHasMultipleWorkspaces && (
        <ConfirmationDialog
          confirmationValue={userEmail}
          confirmationPlaceholder={userEmail ?? ''}
          dialogId={LEAVE_WORKSPACE_MODAL_ID}
          title={t`Leave workspace`}
          subtitle={
            <>
              {t`This action cannot be undone. Your membership will be removed; synced emails and calendars stay with the workspace.`}
              <br />
              {t`Please type in your email to confirm.`}
            </>
          }
          onConfirmClick={leaveWorkspace}
          confirmButtonText={t`Leave workspace`}
        />
      )}
      <ConfirmationDialog
        confirmationValue={userEmail}
        confirmationPlaceholder={userEmail ?? ''}
        dialogId={DELETE_ACCOUNT_MODAL_ID}
        title={t`Account Deletion`}
        subtitle={
          <>
            {t`This action cannot be undone. This will permanently delete your
            entire account.`}
            <br />
            {t`Please type in your email to confirm.`}
          </>
        }
        onConfirmClick={deleteAccount}
        confirmButtonText={t`Delete account`}
      />
    </>
  );
};
