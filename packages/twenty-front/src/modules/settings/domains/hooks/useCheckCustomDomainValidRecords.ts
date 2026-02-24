import { useCheckCustomDomainValidRecordsMutation } from '~/generated-metadata/graphql';
import { useRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilStateV2';
import { isDefined } from 'twenty-shared/utils';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { customDomainRecordsState } from '@/settings/domains/states/customDomainRecordsState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

export const useCheckCustomDomainValidRecords = () => {
  const [checkCustomDomainValidRecords] =
    useCheckCustomDomainValidRecordsMutation();
  const { enqueueErrorSnackBar } = useSnackBar();
  const currentWorkspace = useRecoilValueV2(currentWorkspaceState);

  const [{ isLoading }, setCustomDomainRecords] = useRecoilStateV2(
    customDomainRecordsState,
  );

  const checkCustomDomainRecords = () => {
    if (isLoading || !currentWorkspace?.customDomain) {
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
