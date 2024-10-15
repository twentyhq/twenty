import { IconLink } from 'twenty-ui';
import { SettingsOptionCardContent } from '@/settings/components/SettingsOptionCardContent';
import { Card } from '@/ui/layout/card/components/Card';
import styled from '@emotion/styled';
import { Toggle } from '@/ui/input/components/Toggle';
import { useUpdateWorkspaceMutation } from '~/generated/graphql';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useRecoilState } from 'recoil';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

const StyledToggle = styled(Toggle)`
  margin-left: auto;
`;

export const SettingsSecurityOptionsList = () => {
  const { enqueueSnackBar } = useSnackBar();

  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );

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
        onClick={() =>
          handleChange(!currentWorkspace?.isPublicInviteLinkEnabled)
        }
      >
        <StyledToggle value={currentWorkspace?.isPublicInviteLinkEnabled} />
      </SettingsOptionCardContent>
    </Card>
  );
};
