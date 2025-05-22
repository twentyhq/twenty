import { useCreateUserAndWorkspaceMutation } from '~/generated/graphql';
import {
   SignInUpCallbackNewUser,
  signInUpCallbackState,
} from '@/auth/states/signInUpCallbackState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { AppPath } from '@/types/AppPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { useRequestFreshCaptchaToken } from '@/captcha/hooks/useRequestFreshCaptchaToken';
import { useReadCaptchaToken } from '@/captcha/hooks/useReadCaptchaToken';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { signInUpModeState } from '@/auth/states/signInUpModeState';
import { SignInUpMode } from '@/auth/types/signInUpMode';
import { useSignInWithGoogle } from '@/auth/sign-in-up/hooks/useSignInWithGoogle';
import { useSignInWithMicrosoft } from '@/auth/sign-in-up/hooks/useSignInWithMicrosoft';

export const useCreateWorkspaceFromWorkspaceList = () => {
  const [createUserAndWorkspaceMutation] = useCreateUserAndWorkspaceMutation();
  const { enqueueSnackBar } = useSnackBar();
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();
  const { readCaptchaToken } = useReadCaptchaToken();
  const setSignInUpStep = useSetRecoilState(signInUpStepState);
  const setSignInUpMode = useSetRecoilState(signInUpModeState);
  const { requestFreshCaptchaToken } = useRequestFreshCaptchaToken();
  const { signInWithGoogle } = useSignInWithGoogle();
  const { signInWithMicrosoft } = useSignInWithMicrosoft();

  const signInUpCallback = useRecoilValue(signInUpCallbackState);

  const createUserAndWorkspace = async (params: SignInUpCallbackNewUser) => {
    const token = await readCaptchaToken();

    const { email, firstName, lastName, picture } = params;

    return createUserAndWorkspaceMutation({
      variables: {
        email,
        firstName,
        lastName,
        picture,
        captchaToken: token,
      },
      onCompleted: async (data) => {
        requestFreshCaptchaToken();
        return await redirectToWorkspaceDomain(
          getWorkspaceUrl(data.createUserAndWorkspace.workspace.workspaceUrls),
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
  };

  const handleCreateWorkspaceFromWorkspaceList = async () => {
    if (isDefined(signInUpCallback) && signInUpCallback.type === 'newUser') {
      return createUserAndWorkspace(signInUpCallback);
    }

    if (
      isDefined(signInUpCallback) &&
      signInUpCallback.type === 'existingUser' &&
      signInUpCallback.authProvider === 'google'
    ) {
      return signInWithGoogle({
        action: 'create-new-workspace',
      });
    }

    if (
      isDefined(signInUpCallback) &&
      signInUpCallback.type === 'existingUser' &&
      signInUpCallback.authProvider === 'microsoft'
    ) {
      return signInWithMicrosoft({
        action: 'create-new-workspace',
      });
    }

    setSignInUpMode(SignInUpMode.SignUp);
    setSignInUpStep(SignInUpStep.Password);
  };

  return {
    handleCreateWorkspaceFromWorkspaceList,
  };
};
