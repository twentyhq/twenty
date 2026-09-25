import { getSsoExchangeTokenFromUrlHash } from '@/auth/utils/getSsoExchangeTokenFromUrlHash';
import { hasStayOnDefaultDomainSearchParam } from '@/domain-manager/utils/hasStayOnDefaultDomainSearchParam';
import { isDefined } from 'twenty-shared/utils';

const isPageReload = () =>
  window.performance
    .getEntriesByType('navigation')
    .some(
      (navigationEntry) =>
        'type' in navigationEntry && navigationEntry.type === 'reload',
    );

// Social SSO returns to a bare /welcome, so a stay outlives its url across that round trip and reloads
export const getIsStayingOnDefaultDomainAfterPageLoad = ({
  isStayingOnDefaultDomain,
}: {
  isStayingOnDefaultDomain: boolean;
}) => {
  if (hasStayOnDefaultDomainSearchParam()) {
    return true;
  }

  if (isDefined(getSsoExchangeTokenFromUrlHash()) || isPageReload()) {
    return isStayingOnDefaultDomain;
  }

  return false;
};
