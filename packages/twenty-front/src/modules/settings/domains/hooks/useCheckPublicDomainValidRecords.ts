import { isDefined } from 'twenty-shared/utils';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { publicDomainRecordsState } from '@/settings/domains/states/publicDomainRecordsState';
import { useCheckPublicDomainValidRecordsMutation } from '~/generated-metadata/graphql';
import { useRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilStateV2';

export const useCheckPublicDomainValidRecords = () => {
  const [checkPublicDomainValidRecords] =
    useCheckPublicDomainValidRecordsMutation();
  const { enqueueErrorSnackBar } = useSnackBar();

  const [{ isLoading, publicDomainRecords }, setPublicDomainRecords] =
    useRecoilStateV2(publicDomainRecordsState);

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
        enqueueErrorSnackBar({ apolloError: error });
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
