import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { publicDomainRecordsState } from '@/settings/domains/states/publicDomainRecordsState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useMutation } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/feedback';
import { CheckPublicDomainValidRecordsDocument } from '~/generated-metadata/graphql';

export const useCheckPublicDomainValidRecords = () => {
  const [checkPublicDomainValidRecords] = useMutation(
    CheckPublicDomainValidRecordsDocument,
  );
  const { enqueueToast } = useToast();

  const [{ isLoading, publicDomainRecords }, setPublicDomainRecords] =
    useAtomState(publicDomainRecordsState);

  const checkPublicDomainRecords = (domain: string) => {
    if (isLoading) {
      return;
    }
    setPublicDomainRecords((currentState) => ({
      ...currentState,
      isLoading: true,
    }));
    checkPublicDomainValidRecords({
      variables: {
        domain,
      },
      onCompleted: (data) => {
        setPublicDomainRecords((currentState) => ({
          ...currentState,
          isLoading: false,
          ...(isDefined(data.checkPublicDomainValidRecords)
            ? { publicDomainRecords: data.checkPublicDomainValidRecords }
            : {}),
        }));
      },
      onError: (error) => {
        enqueueToast(getToastOptionsFromError({ error }));
        setPublicDomainRecords((currentState) => ({
          ...currentState,
          isLoading: false,
        }));
      },
    });
  };

  return {
    isLoading,
    publicDomainRecords,
    checkPublicDomainRecords,
  };
};
