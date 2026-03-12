import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { AppPath } from 'twenty-shared/types';
import { useMutation } from '@apollo/client/react';
import { SignUpInNewWorkspaceDocument } from '~/generated-metadata/graphql';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { useLingui } from '@lingui/react/macro';

export const useSignUpInNewWorkspace = () => {
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { t } = useLingui();

  const [signUpInNewWorkspaceMutation] = useMutation(SignUpInNewWorkspaceDocument);

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
        ...(CombinedGraphQLErrors.is(error)
          ? { apolloError: error }
          : { message: t`Workspace creation failed` }),
      });
    }
  };

  return {
    createWorkspace,
  };
};
