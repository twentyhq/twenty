import { useRecoilValue } from 'recoil';

import { useAuth } from '@/auth/hooks/useAuth';
import { availableWorkspacesState } from '@/auth/states/availableWorkspacesState';
import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { countAvailableWorkspaces } from '@/auth/utils/availableWorkspacesUtils';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import {
  useDeleteUserAccountMutation,
  useDeleteUserWorkspaceMutation,
} from '~/generated-metadata/graphql';

const DELETE_ACCOUNT_MODAL_ID = 'delete-account-modal';
const LEAVE_WORKSPACE_MODAL_ID = 'leave-workspace-modal';

const StyledDiv = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

export const DeleteAccount = () => {
  const { t } = useLingui();
  const { openModal } = useModal();
  const { enqueueErrorSnackBar } = useSnackBar();

  const [deleteUserAccount] = useDeleteUserAccountMutation();
  const [deleteUserFromWorkspace] = useDeleteUserWorkspaceMutation();
  const currentUser = useRecoilValue(currentUserState);
  const userEmail = currentUser?.email;
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const currentWorkspaceMemberId = currentWorkspaceMember?.id;
  const { signOut } = useAuth();
  const availableWorkspaces = useRecoilValue(availableWorkspacesState);
  const availableWorkspacesCount =
    countAvailableWorkspaces(availableWorkspaces);

  const userHasMultipleWorkspaces = availableWorkspacesCount > 1;

  const deleteAccount = async () => {
    await deleteUserAccount();
    await signOut();
  };

  const leaveWorkspace = async () => {
    if (!isDefined(currentWorkspaceMemberId)) {
      enqueueErrorSnackBar({
        message: t`Current workspace member not found.`,
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
      <H2Title
        title={t`Danger zone`}
        description={
          userHasMultipleWorkspaces
            ? t`Delete account and all the associated data or leave workspace`
            : t`Delete account and all the associated data`
        }
      />
      {userHasMultipleWorkspaces && (
        <StyledDiv>
          <Button
            accent="danger"
            onClick={() => openModal(LEAVE_WORKSPACE_MODAL_ID)}
            variant="secondary"
            title={t`Leave workspace`}
          />

          <ConfirmationModal
            confirmationValue={userEmail}
            confirmationPlaceholder={userEmail ?? ''}
            modalId={LEAVE_WORKSPACE_MODAL_ID}
            title={t`Leave workspace`}
            subtitle={
              <>
                {t`This action cannot be undone. This will permanently remove your membership from this workspace.`}
                <br />
                {t`Please type in your email to confirm.`}
              </>
            }
            onConfirmClick={leaveWorkspace}
            confirmButtonText={t`Leave workspace`}
          />
        </StyledDiv>
      )}
      <Button
        accent="danger"
        onClick={() => openModal(DELETE_ACCOUNT_MODAL_ID)}
        variant="secondary"
        title={t`Delete account`}
      />
      <ConfirmationModal
        confirmationValue={userEmail}
        confirmationPlaceholder={userEmail ?? ''}
        modalId={DELETE_ACCOUNT_MODAL_ID}
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
