import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';
import { AppPath } from '@/types/AppPath';
import { useSignUpInNewWorkspaceMutation } from '~/generated/graphql';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

export const useSignUpInNewWorkspace = () => {
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();
  const { enqueueSnackBar } = useSnackBar();

  const [signUpInNewWorkspaceMutation] = useSignUpInNewWorkspaceMutation();

  const createWorkspace = ({ newTab } = { newTab: true }) => {
    signUpInNewWorkspaceMutation({
      onCompleted: async (data) => {
        return await redirectToWorkspaceDomain(
          getWorkspaceUrl(data.signUpInNewWorkspace.workspace.workspaceUrls),
          AppPath.Verify,
          {
            loginToken: data.signUpInNewWorkspace.loginToken.token,
          },
          newTab ? '_blank' : '_self',
        );
      },
      onError: (error: Error) => {
        enqueueSnackBar(error.message, {
          variant: SnackBarVariant.Error,
        });
      },
    });
  };

  return {
    createWorkspace,
  };
};
