import { useCreateUserAndWorkspaceMutation } from '~/generated/graphql';
import { userDataForNewUserAndWorkspaceState } from '@/auth/states/userDataForNewUserAndWorkspaceState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { AppPath } from '@/types/AppPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { useRequestFreshCaptchaToken } from '@/captcha/hooks/useRequestFreshCaptchaToken';
import { useReadCaptchaToken } from '@/captcha/hooks/useReadCaptchaToken';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useCreateUserAndWorkspace = () => {
  const [createUserAndWorkspaceMutation] = useCreateUserAndWorkspaceMutation();
  const { enqueueSnackBar } = useSnackBar();
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();
  const { readCaptchaToken } = useReadCaptchaToken();

  const { requestFreshCaptchaToken } = useRequestFreshCaptchaToken();

  const userDataForNewUserAndWorkspace = useRecoilValue(
    userDataForNewUserAndWorkspaceState,
  );

  const createUserAndWorkspace = async () => {
    const token = await readCaptchaToken();
    if (isDefined(userDataForNewUserAndWorkspace)) {
      createUserAndWorkspaceMutation({
        variables: {
          ...userDataForNewUserAndWorkspace,
          captchaToken: token,
        },
        onCompleted: async (data) => {
          requestFreshCaptchaToken();
          return await redirectToWorkspaceDomain(
            getWorkspaceUrl(
              data.createUserAndWorkspace.workspace.workspaceUrls,
            ),
            AppPath.Verify,
            {
              loginToken: data.createUserAndWorkspace.loginToken.token,
            },
          );
        },
        onError: (error: Error) => {
          enqueueSnackBar(error.message, {
            variant: SnackBarVariant.Error,
          });
        },
      });
    }
  };

  return {
    createUserAndWorkspace,
  };
};
