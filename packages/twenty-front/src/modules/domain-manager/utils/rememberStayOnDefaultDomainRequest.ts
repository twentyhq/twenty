import { STAY_ON_DEFAULT_DOMAIN_SEARCH_PARAM } from '@/domain-manager/constants/StayOnDefaultDomainSearchParam';
import { STAY_ON_DEFAULT_DOMAIN_SESSION_STORAGE_KEY } from '@/domain-manager/constants/StayOnDefaultDomainSessionStorageKey';

// Social SSO leaves and comes back to a bare /welcome, so the marker has to
// outlive the url that carried it here
export const rememberStayOnDefaultDomainRequest = () => {
  if (
    new URLSearchParams(window.location.search).has(
      STAY_ON_DEFAULT_DOMAIN_SEARCH_PARAM,
    )
  ) {
    sessionStorage.setItem(STAY_ON_DEFAULT_DOMAIN_SESSION_STORAGE_KEY, 'true');
  }
};
