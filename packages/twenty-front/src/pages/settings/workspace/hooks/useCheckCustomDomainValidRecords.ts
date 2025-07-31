import { customDomainRecordsState } from '~/pages/settings/workspace/states/customDomainRecordsState';
import { useCheckCustomDomainValidRecordsMutation } from '~/generated-metadata/graphql';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

export const useCheckCustomDomainValidRecords = () => {
  const [checkCustomDomainValidRecords] =
    useCheckCustomDomainValidRecordsMutation();
  const { enqueueErrorSnackBar } = useSnackBar();

  const setCustomDomainRecords = useSetRecoilState(customDomainRecordsState);

  const checkCustomDomainRecords = () => {
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
