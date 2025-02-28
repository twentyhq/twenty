import { useEffect } from 'react';
import { useCheckCustomDomainValidRecords } from '~/pages/settings/workspace/hooks/useCheckCustomDomainValidRecords';

export const SettingsCustomDomainEffect = () => {
  const { checkCustomDomainRecords } = useCheckCustomDomainValidRecords();

  useEffect(() => {
    checkCustomDomainRecords();
    // Verify only needs to run once at mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
};
