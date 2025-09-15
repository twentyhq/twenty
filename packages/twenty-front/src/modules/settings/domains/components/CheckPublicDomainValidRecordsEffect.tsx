import { useEffect } from 'react';
import { useCheckPublicDomainValidRecords } from '@/settings/domains/hooks/useCheckPublicDomainValidRecords';
import { type PublicDomain } from '~/generated/graphql';

export const CheckPublicDomainValidRecordsEffect = ({
  publicDomain,
}: {
  publicDomain: PublicDomain;
}) => {
  const { checkPublicDomainRecords } = useCheckPublicDomainValidRecords();

  useEffect(() => {
    checkPublicDomainRecords(publicDomain.domain);
    // Check public domain only needs to run once at mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
};
