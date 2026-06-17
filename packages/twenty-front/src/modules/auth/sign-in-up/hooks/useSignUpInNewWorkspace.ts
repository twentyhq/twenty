import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { AppPath } from 'twenty-shared/types';
import { useMutation } from '@apollo/client/react';
import {
  SignUpInNewWorkspaceDocument,
  UploadNewWorkspaceLogoDocument,
} from '~/generated-metadata/graphql';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { useLingui } from '@lingui/react/macro';

export const useSignUpInNewWorkspace = () => {
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { t } = useLingui();

  const [signUpInNewWorkspaceMutation] = useMutation(
    SignUpInNewWorkspaceDocument,
  );
  const [uploadNewWorkspaceLogoMutation] = useMutation(
    UploadNewWorkspaceLogoDocument,
  );

  const createWorkspace = async ({
    displayName,
    subdomain,
    logo,
    newTab = true,
  }: {
    displayName?: string;
    subdomain?: string;
    logo?: File;
    newTab?: boolean;
  } = {}) => {
    try {
      const { data } = await signUpInNewWorkspaceMutation({
        variables: { input: { displayName, subdomain } },
      });
      assertIsDefinedOrThrow(data?.signUpInNewWorkspace);

      const workspaceId = data.signUpInNewWorkspace.workspace.id;

      if (isDefined(logo)) {
        // A logo upload failure should not block workspace creation.
        try {
          await uploadNewWorkspaceLogoMutation({
            variables: { workspaceId, file: logo },
          });
        } catch (logoUploadError) {
          enqueueErrorSnackBar(
            CombinedGraphQLErrors.is(logoUploadError)
              ? { apolloError: logoUploadError }
              : {
                  message:
                    logoUploadError instanceof Error
                      ? logoUploadError.message
                      : t`Workspace logo upload failed`,
                },
          );
        }
      }

      return await redirectToWorkspaceDomain(
        getWorkspaceUrl(data.signUpInNewWorkspace.workspace.workspaceUrls),
        AppPath.Verify,
        {
          loginToken: data.signUpInNewWorkspace.loginToken.token,
        },
        newTab ? '_blank' : '_self',
      );
    } catch (error) {
      enqueueErrorSnackBar(
        CombinedGraphQLErrors.is(error)
          ? { apolloError: error }
          : {
              message:
                error instanceof Error
                  ? error.message
                  : t`Workspace creation failed`,
            },
      );
    }
  };

  return {
    createWorkspace,
  };
};
