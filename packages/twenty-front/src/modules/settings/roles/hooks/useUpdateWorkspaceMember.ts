import { useMutation } from '@apollo/client';

import {
    TOGGLE_MEMBER_STATUS,
    UPDATE_MEMBER_ROLE,
} from '@/settings/roles/graphql/mutations/updateWorkspaceMember';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

interface UseUpdateWorkspaceMemberReturn {
  toggleMemberStatus: (userId: string, workspaceId: string) => Promise<void>;
  loading: boolean;
  error: Error | undefined;
  updateMemberRole: (
    roleId: string,
    userId: string,
    workspaceId: string,
  ) => Promise<void>;
}

export const useUpdateWorkspaceMember = (): UseUpdateWorkspaceMemberReturn => {
  const { enqueueSnackBar } = useSnackBar();

  const [toggleMemberStatusMutation, { loading, error }] = useMutation(
    TOGGLE_MEMBER_STATUS,
    {
      onCompleted: () => {
        enqueueSnackBar('Member status toggled successfully!', {
          variant: SnackBarVariant.Success,
        });
      },
    },
  );

  const toggleMemberStatus = async (userId: string, workspaceId: string) => {
    try {
      await toggleMemberStatusMutation({
        variables: {
          userId,
          workspaceId,
        },
      });
    } catch (err) {
      enqueueSnackBar('Error toggling member status', {
        variant: SnackBarVariant.Error,
      });
    }
  };

  const [updateMemberRoleMutation] = useMutation(UPDATE_MEMBER_ROLE, {
    onCompleted: () => {
      enqueueSnackBar('Member role updated successfully!', {
        variant: SnackBarVariant.Success,
      });
    },
  });

  const updateMemberRole = async (
    roleId: string,
    userId: string,
    workspaceId: string,
  ) => {
    try {
      await updateMemberRoleMutation({
        variables: {
          roleId,
          userId,
          workspaceId,
        },
      });
    } catch (err) {
      enqueueSnackBar('Error updating member role', {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return {
    toggleMemberStatus,
    loading,
    error,
    updateMemberRole,
  };
};
