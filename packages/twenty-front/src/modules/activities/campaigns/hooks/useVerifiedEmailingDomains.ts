import { useQuery } from '@apollo/client/react';

import { FIND_VERIFIED_EMAILING_DOMAINS } from '@/activities/campaigns/graphql/queries/findVerifiedEmailingDomains';

type EmailingDomain = {
  id: string;
  domain: string;
  status: string;
};

type FindVerifiedEmailingDomainsResult = {
  getEmailingDomains: EmailingDomain[];
};

export const useVerifiedEmailingDomains = () => {
  const { data, loading, error } = useQuery<FindVerifiedEmailingDomainsResult>(
    FIND_VERIFIED_EMAILING_DOMAINS,
  );

  const verifiedDomains = (data?.getEmailingDomains ?? []).filter(
    (domain) => domain.status === 'VERIFIED',
  );

  return { verifiedDomains, loading, error };
};
