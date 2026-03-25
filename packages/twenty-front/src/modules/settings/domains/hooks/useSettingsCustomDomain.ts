/* @license Enterprise */
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useCheckCustomDomainValidRecords } from '@/settings/domains/hooks/useCheckCustomDomainValidRecords';
import { getDomainValidationSchema } from '@/settings/domains/utils/getDomainValidationSchema';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';

export const useSettingsCustomDomain = () => {
  const { t } = useLingui();
  const domainSchema = getDomainValidationSchema();

  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);
  const { checkCustomDomainRecords } = useCheckCustomDomainValidRecords();

  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );

  const [customDomain, setCustomDomain] = useState(
    currentWorkspace?.customDomain ?? '',
  );
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (value: string) => {
    setCustomDomain(value);

    const result = domainSchema.safeParse(value);

    setError(result.success ? undefined : result.error.issues[0].message);
  };

  const handleDelete = () => {
    setCustomDomain('');
    setError(undefined);
  };

  const hasChanged = customDomain !== (currentWorkspace?.customDomain ?? '');
  const isSaveDisabled = !hasChanged || isDefined(error) || isSubmitting;

  const handleSave = () => {
    if (!isDefined(currentWorkspace) || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    const domainValue = customDomain.length > 0 ? customDomain : null;

    updateWorkspace({
      variables: {
        input: { customDomain: domainValue },
      },
      onCompleted: () => {
        setCurrentWorkspace({
          ...currentWorkspace,
          customDomain: domainValue,
        });
        enqueueSuccessSnackBar({ message: t`Custom domain updated` });
        setIsSubmitting(false);
        checkCustomDomainRecords();
      },
      onError: (mutationError) => {
        if (
          CombinedGraphQLErrors.is(mutationError) &&
          mutationError.errors[0]?.extensions?.code === 'CONFLICT'
        ) {
          setError(t`Domain already taken`);
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
    });
  };

  return {
    customDomain,
    error,
    isSubmitting,
    isSaveDisabled,
    handleChange,
    handleDelete,
    handleSave,
  };
};
