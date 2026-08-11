import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { getSubdomainValidationSchema } from '@/settings/domains/utils/getSubdomainValidationSchema';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';

export const SUBDOMAIN_CHANGE_CONFIRMATION_MODAL_ID =
  'subdomain-change-confirmation-modal';

export const useSettingsSubdomain = () => {
  const { t } = useLingui();
  const subdomainSchema = getSubdomainValidationSchema();

  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();
  const { openModal, closeModal } = useModal();

  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );

  const [subdomain, setSubdomain] = useState(currentWorkspace?.subdomain ?? '');
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (value: string) => {
    setSubdomain(value);

    const result = subdomainSchema.safeParse(value);

    setError(result.success ? undefined : result.error.issues[0].message);
  };

  const hasChanged = subdomain !== currentWorkspace?.subdomain;
  const isSaveDisabled = !hasChanged || isDefined(error) || isSubmitting;

  const handleSave = () => {
    if (isDefined(currentWorkspace)) {
      openModal(SUBDOMAIN_CHANGE_CONFIRMATION_MODAL_ID);
    }
  };

  const handleConfirm = () => {
    if (!isDefined(currentWorkspace) || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    updateWorkspace({
      variables: {
        input: { subdomain },
      },
      onError: (mutationError) => {
        if (
          CombinedGraphQLErrors.is(mutationError) &&
          mutationError.errors[0]?.extensions?.code === 'CONFLICT'
        ) {
          closeModal(SUBDOMAIN_CHANGE_CONFIRMATION_MODAL_ID);
          setError(t`Subdomain already taken`);
          setIsSubmitting(false);

          return;
        }
        if (CombinedGraphQLErrors.is(mutationError)) {
          enqueueErrorSnackBar({ apolloError: mutationError });
        } else {
          enqueueErrorSnackBar({});
        }
        setIsSubmitting(false);
      },
      onCompleted: async () => {
        const currentUrl = new URL(window.location.href);

        currentUrl.hostname = new URL(
          currentWorkspace.workspaceUrls.subdomainUrl,
        ).hostname.replace(currentWorkspace.subdomain, subdomain);

        setCurrentWorkspace({ ...currentWorkspace, subdomain });
        enqueueSuccessSnackBar({ message: t`Subdomain updated` });
        setIsSubmitting(false);

        await redirectToWorkspaceDomain(currentUrl.toString());
      },
    });
  };

  return {
    subdomain,
    error,
    isSubmitting,
    isSaveDisabled,
    handleChange,
    handleSave,
    handleConfirm,
  };
};
