import { useAuth } from '@/auth/hooks/useAuth';
import { useUploadNewWorkspaceLogo } from '@/auth/sign-in-up/hooks/useUploadNewWorkspaceLogo';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { AppPath } from 'twenty-shared/types';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components';
import { SignUpInNewWorkspaceDocument } from '~/generated-metadata/graphql';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';

export const useSignUpInNewWorkspace = () => {
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();
  const { getAuthTokensFromLoginToken } = useAuth();
  const isMultiWorkspaceEnabled = useAtomStateValue(
    isMultiWorkspaceEnabledState,
  );
  const { enqueueToast } = useToast();
  const { t } = useLingui();

  const [signUpInNewWorkspaceMutation] = useMutation(
    SignUpInNewWorkspaceDocument,
  );
  const { uploadNewWorkspaceLogo } = useUploadNewWorkspaceLogo();

  const createWorkspace = async ({
    displayName,
    subdomain,
    logo,
  }: {
    displayName?: string;
    subdomain?: string;
    logo?: File;
  } = {}): Promise<boolean> => {
    try {
      const { data } = await signUpInNewWorkspaceMutation({
        variables: { input: { displayName, subdomain } },
      });
      assertIsDefinedOrThrow(data?.signUpInNewWorkspace);

      const workspaceId = data.signUpInNewWorkspace.workspace.id;

      if (isDefined(logo)) {
        try {
          await uploadNewWorkspaceLogo({ workspaceId, file: logo });
        } catch (logoUploadError) {
          if (CombinedGraphQLErrors.is(logoUploadError)) {
            enqueueToast(getToastOptionsFromError({ error: logoUploadError }));
          } else {
            enqueueToast({
              variant: 'error',
              children:
                logoUploadError instanceof Error
                  ? logoUploadError.message
                  : t`Workspace logo upload failed`,
            });
          }
        }
      }

      const loginToken = data.signUpInNewWorkspace.loginToken.token;

      if (!isMultiWorkspaceEnabled) {
        await getAuthTokensFromLoginToken(loginToken);
        return true;
      }

      await redirectToWorkspaceDomain(
        getWorkspaceUrl(data.signUpInNewWorkspace.workspace.workspaceUrls),
        AppPath.Verify,
        { loginToken },
        '_self',
      );

      return true;
    } catch (error) {
      if (CombinedGraphQLErrors.is(error)) {
        enqueueToast(getToastOptionsFromError({ error }));
      } else {
        enqueueToast({
          variant: 'error',
          children:
            error instanceof Error
              ? error.message
              : t`Workspace creation failed`,
        });
      }

      return false;
    }
  };

  return {
    createWorkspace,
  };
};
