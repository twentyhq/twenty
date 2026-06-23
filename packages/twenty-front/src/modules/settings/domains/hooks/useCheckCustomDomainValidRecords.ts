import { useMutation } from '@apollo/client/react';
import { CheckCustomDomainValidRecordsDocument } from '~/generated-metadata/graphql';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { isDefined } from 'twenty-shared/utils';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { customDomainRecordsState } from '@/settings/domains/states/customDomainRecordsState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';

export const useCheckCustomDomainValidRecords = () => {
  const [checkCustomDomainValidRecords] = useMutation(
    CheckCustomDomainValidRecordsDocument,
  );
  const { enqueueErrorSnackBar } = useSnackBar();
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );

  const [{ isLoading }, setCustomDomainRecords] = useAtomState(
    customDomainRecordsState,
  );

  // Accept the domain explicitly so callers can pass a freshly-saved value
  // instead of relying on the closed-over (and potentially stale) workspace
  const checkCustomDomainRecords = (
    customDomain: string | null | undefined = currentWorkspace?.customDomain,
  ) => {
    if (isLoading || !customDomain) {
      return;
    }
    setCustomDomainRecords((currentState) => ({
      ...currentState,
      isLoading: true,
    }));
    checkCustomDomainValidRecords({
      onCompleted: (data) => {
        const validRecords = data.checkCustomDomainValidRecords;

        setCustomDomainRecords((currentState) => ({
          ...currentState,
          isLoading: false,
          ...(isDefined(validRecords)
            ? { customDomainRecords: validRecords }
            : {}),
        }));

        // Keep the workspace activation badge in sync without a page reload
        const nextIsCustomDomainEnabled = validRecords?.isCustomDomainEnabled;

        if (isDefined(nextIsCustomDomainEnabled)) {
          setCurrentWorkspace((previousWorkspace) =>
            isDefined(previousWorkspace)
              ? {
                  ...previousWorkspace,
                  isCustomDomainEnabled: nextIsCustomDomainEnabled,
                }
              : previousWorkspace,
          );
        }
      },
      onError: (error) => {
        enqueueErrorSnackBar({ apolloError: error });
        setCustomDomainRecords((currentState) => ({
          ...currentState,
          isLoading: false,
        }));
      },
    });
  };

  return {
    checkCustomDomainRecords,
  };
};
