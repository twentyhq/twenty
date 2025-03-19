import { customDomainRecordsState } from '~/pages/settings/workspace/states/customDomainRecordsState';
import { useCheckCustomDomainValidRecordsMutation } from '~/generated/graphql';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useCheckCustomDomainValidRecords = () => {
  const [checkCustomDomainValidRecords] =
    useCheckCustomDomainValidRecordsMutation();

  const setCustomDomainRecords = useSetRecoilState(customDomainRecordsState);

  const checkCustomDomainRecords = () => {
    setCustomDomainRecords((currentState) => ({
      ...currentState,
      loading: true,
    }));
    checkCustomDomainValidRecords({
      onCompleted: (data) => {
        if (isDefined(data.checkCustomDomainValidRecords)) {
          setCustomDomainRecords({
            loading: false,
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
