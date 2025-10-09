import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ApolloError } from '@apollo/client';
import { AppPath } from 'twenty-shared/types';
import { useSignUpInNewWorkspaceMutation } from '~/generated-metadata/graphql';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { useLingui } from '@lingui/react/macro';

export const useSignUpInNewWorkspace = () => {
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { t } = useLingui();

  const [signUpInNewWorkspaceMutation] = useSignUpInNewWorkspaceMutation();

  const createWorkspace = async ({ newTab } = { newTab: true }) => {
    try {
      const { data } = await signUpInNewWorkspaceMutation();
      assertIsDefinedOrThrow(data?.signUpInNewWorkspace);
      return await redirectToWorkspaceDomain(
        getWorkspaceUrl(data.signUpInNewWorkspace.workspace.workspaceUrls),
        AppPath.Verify,
        {
          loginToken: data.signUpInNewWorkspace.loginToken.token,
        },
        newTab ? '_blank' : '_self',
      );
    } catch (error) {
      enqueueErrorSnackBar({
        ...(error instanceof ApolloError
          ? { apolloError: error }
          : { message: t`Workspace creation failed` }),
      });
    }
  };

  return {
    createWorkspace,
  };
};
