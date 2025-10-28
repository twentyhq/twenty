/* @license Enterprise */
import { useEffect } from 'react';
import { useCheckCustomDomainValidRecords } from '@/settings/domains/hooks/useCheckCustomDomainValidRecords';

export const CheckCustomDomainValidRecordsEffect = () => {
  const { checkCustomDomainRecords } = useCheckCustomDomainValidRecords();

  useEffect(() => {
    checkCustomDomainRecords();
    // Check custom domain only needs to run once at mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
};
