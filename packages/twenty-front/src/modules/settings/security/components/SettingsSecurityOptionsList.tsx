import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsOptionCardContent } from '@/settings/components/SettingsOptionCardContent';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilState } from 'recoil';
import { Card, IconLink, isDefined } from 'twenty-ui';
import { useUpdateWorkspaceMutation } from '~/generated/graphql';

export const SettingsSecurityOptionsList = () => {
  const { enqueueSnackBar } = useSnackBar();

  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );
  if (!isDefined(currentWorkspace)) {
    throw new Error(
      'The current workspace must be defined to edit its security options.',
    );
  }

  const [updateWorkspace] = useUpdateWorkspaceMutation();

  const handleChange = async (value: boolean) => {
    try {
      if (!currentWorkspace?.id) {
        throw new Error('User is not logged in');
      }
      await updateWorkspace({
        variables: {
          input: {
            isPublicInviteLinkEnabled: value,
          },
        },
      });
      setCurrentWorkspace({
        ...currentWorkspace,
        isPublicInviteLinkEnabled: value,
      });
    } catch (err: any) {
      enqueueSnackBar(err?.message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return (
    <Card>
      <SettingsOptionCardContent
        Icon={IconLink}
        title="Invite by Link"
        description="Allow the invitation of new users by sharing an invite link."
        checked={currentWorkspace.isPublicInviteLinkEnabled}
        onChange={() =>
          handleChange(!currentWorkspace.isPublicInviteLinkEnabled)
        }
      />
    </Card>
  );
};
