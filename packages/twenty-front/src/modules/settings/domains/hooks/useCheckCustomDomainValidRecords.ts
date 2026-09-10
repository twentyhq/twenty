import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { customDomainRecordsState } from '@/settings/domains/states/customDomainRecordsState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useMutation } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/feedback';
import { CheckCustomDomainValidRecordsDocument } from '~/generated-metadata/graphql';

export const useCheckCustomDomainValidRecords = () => {
  const [checkCustomDomainValidRecords] = useMutation(
    CheckCustomDomainValidRecordsDocument,
  );
  const { enqueueToast } = useToast();
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );

  const [{ isLoading }, setCustomDomainRecords] = useAtomState(
    customDomainRecordsState,
  );

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
        enqueueToast(getToastOptionsFromError({ error }));
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
