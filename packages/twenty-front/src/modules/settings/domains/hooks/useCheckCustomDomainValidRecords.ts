import { useCheckCustomDomainValidRecordsMutation } from '~/generated-metadata/graphql';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { customDomainRecordsState } from '@/settings/domains/states/customDomainRecordsState';

export const useCheckCustomDomainValidRecords = () => {
  const [checkCustomDomainValidRecords] =
    useCheckCustomDomainValidRecordsMutation();
  const { enqueueErrorSnackBar } = useSnackBar();

  const [{ isLoading }, setCustomDomainRecords] = useRecoilState(
    customDomainRecordsState,
  );

  const checkCustomDomainRecords = () => {
    if (isLoading) {
      return;
    }
    setCustomDomainRecords((currentState) => ({
      ...currentState,
      isLoading: true,
    }));
    checkCustomDomainValidRecords({
      onCompleted: (data) => {
        setCustomDomainRecords((currentState) => ({
          ...currentState,
          isLoading: false,
          ...(isDefined(data.checkCustomDomainValidRecords)
            ? { customDomainRecords: data.checkCustomDomainValidRecords }
            : {}),
        }));
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
