import { STAY_ON_DEFAULT_DOMAIN_SEARCH_PARAM } from '@/domain-manager/constants/StayOnDefaultDomainSearchParam';

export const hasStayOnDefaultDomainSearchParam = () =>
  new URLSearchParams(window.location.search).has(
    STAY_ON_DEFAULT_DOMAIN_SEARCH_PARAM,
  );
