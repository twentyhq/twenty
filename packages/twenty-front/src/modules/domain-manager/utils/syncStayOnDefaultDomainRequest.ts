import { STAY_ON_DEFAULT_DOMAIN_SEARCH_PARAM } from '@/domain-manager/constants/StayOnDefaultDomainSearchParam';
import { STAY_ON_DEFAULT_DOMAIN_SESSION_STORAGE_KEY } from '@/domain-manager/constants/StayOnDefaultDomainSessionStorageKey';
import { forgetStayOnDefaultDomainRequest } from '@/domain-manager/utils/forgetStayOnDefaultDomainRequest';

const isSocialSsoReturn = () =>
  new URLSearchParams(window.location.hash.substring(1)).has(
    'ssoExchangeToken',
  );

const isPageReload = () =>
  window.performance
    ?.getEntriesByType?.('navigation')
    .some(
      (navigationEntry) =>
        (navigationEntry as PerformanceNavigationTiming).type === 'reload',
    ) ?? false;

// Social SSO leaves and comes back to a bare /welcome, so the marker has to
// outlive the url that carried it here, but only across that round trip or a
// reload: arriving any other way (browser back, a typed url) is a plain visit
export const syncStayOnDefaultDomainRequest = () => {
  if (
    !new URLSearchParams(window.location.search).has(
      STAY_ON_DEFAULT_DOMAIN_SEARCH_PARAM,
    )
  ) {
    if (!isSocialSsoReturn() && !isPageReload()) {
      forgetStayOnDefaultDomainRequest();
    }

    return;
  }

  try {
    window.sessionStorage.setItem(
      STAY_ON_DEFAULT_DOMAIN_SESSION_STORAGE_KEY,
      'true',
    );
  } catch {
    return;
  }
};
