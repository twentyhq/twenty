import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useEffect, useCallback } from 'react';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';
import { useCheckCustomDomainValidRecordsMutation } from '~/generated/graphql';
import { customDomainRecordsState } from '~/pages/settings/workspace/states/customDomainRecordsState';

export const SettingsCustomDomainEffect = () => {
  const [checkCustomDomainValidRecords] =
    useCheckCustomDomainValidRecordsMutation();

  const setCustomDomainRecords = useSetRecoilState(customDomainRecordsState);

  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const checkCustomDomainValidRecordsPolling = useCallback(async () => {
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
  }, [checkCustomDomainValidRecords, setCustomDomainRecords]);

  useEffect(() => {
    let pollIntervalFn: null | ReturnType<typeof setInterval> = null;
    if (isDefined(currentWorkspace?.customDomain)) {
      checkCustomDomainValidRecordsPolling();
      pollIntervalFn = setInterval(checkCustomDomainValidRecordsPolling, 6000);
    }

    return () => {
      if (isDefined(pollIntervalFn)) {
        clearInterval(pollIntervalFn);
      }
    };
  }, [checkCustomDomainValidRecordsPolling, currentWorkspace?.customDomain]);

  return <></>;
};
