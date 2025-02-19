import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useEffect, useCallback } from 'react';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';
import { useCheckCustomDomainValidRecordsMutation } from '~/generated/graphql';
import { customDomainRecordsState } from '~/pages/settings/workspace/states/customDomainRecordsState';

export const SettingsCustomDomainEffect = () => {
  const [checkCustomDomainValidRecords, { data: customDomainRecords }] =
    useCheckCustomDomainValidRecordsMutation();

  const setCustomDomainRecords = useSetRecoilState(customDomainRecordsState);

  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const initInterval = useCallback(() => {
    return setInterval(async () => {
      await checkCustomDomainValidRecords();
      if (isDefined(customDomainRecords?.checkCustomDomainValidRecords)) {
        setCustomDomainRecords(
          customDomainRecords.checkCustomDomainValidRecords,
        );
      }
    }, 3000);
  }, [
    checkCustomDomainValidRecords,
    customDomainRecords,
    setCustomDomainRecords,
  ]);

  useEffect(() => {
    let pollIntervalFn: null | ReturnType<typeof setInterval> = null;
    if (isDefined(currentWorkspace?.customDomain)) {
      pollIntervalFn = initInterval();
    }

    return () => {
      if (isDefined(pollIntervalFn)) {
        clearInterval(pollIntervalFn);
      }
    };
  }, [currentWorkspace?.customDomain, initInterval]);

  return <></>;
};
