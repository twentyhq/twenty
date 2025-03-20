import { customDomainRecordsState } from '~/pages/settings/workspace/states/customDomainRecordsState';
import { useCheckCustomDomainValidRecordsMutation } from '~/generated/graphql';
import { isDefined } from 'twenty-shared';
import { useSetRecoilState } from 'recoil';

export const useCheckCustomDomainValidRecords = () => {
  const [checkCustomDomainValidRecords] =
    useCheckCustomDomainValidRecordsMutation();

  const setCustomDomainRecords = useSetRecoilState(customDomainRecordsState);

  const checkCustomDomainRecords = () => {
    setCustomDomainRecords((currentState) => ({
      ...currentState,
      isLoading: true,
    }));
    checkCustomDomainValidRecords({
      onCompleted: (data) => {
        if (isDefined(data.checkCustomDomainValidRecords)) {
          setCustomDomainRecords({
            isLoading: false,
            customDomainRecords: data.checkCustomDomainValidRecords,
          });
        }
      },
    });
  };

  return {
    checkCustomDomainRecords,
  };
};
