import { getSsoExchangeTokenFromUrlHash } from '@/auth/utils/getSsoExchangeTokenFromUrlHash';
import { STAY_ON_DEFAULT_DOMAIN_SESSION_STORAGE_KEY } from '@/domain-manager/constants/StayOnDefaultDomainSessionStorageKey';
import { forgetStayOnDefaultDomainRequest } from '@/domain-manager/utils/forgetStayOnDefaultDomainRequest';
import { hasStayOnDefaultDomainSearchParam } from '@/domain-manager/utils/hasStayOnDefaultDomainSearchParam';
import { isDefined } from 'twenty-shared/utils';

const isSocialSsoReturn = () => isDefined(getSsoExchangeTokenFromUrlHash());

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
  if (!hasStayOnDefaultDomainSearchParam()) {
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
