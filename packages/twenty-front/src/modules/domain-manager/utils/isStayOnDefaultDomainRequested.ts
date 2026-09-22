import { STAY_ON_DEFAULT_DOMAIN_SEARCH_PARAM } from '@/domain-manager/constants/StayOnDefaultDomainSearchParam';
import { STAY_ON_DEFAULT_DOMAIN_SESSION_STORAGE_KEY } from '@/domain-manager/constants/StayOnDefaultDomainSessionStorageKey';

const isStayOnDefaultDomainRemembered = () => {
  try {
    return (
      window.sessionStorage.getItem(
        STAY_ON_DEFAULT_DOMAIN_SESSION_STORAGE_KEY,
      ) === 'true'
    );
  } catch {
    return false;
  }
};

export const isStayOnDefaultDomainRequested = () =>
  new URLSearchParams(window.location.search).has(
    STAY_ON_DEFAULT_DOMAIN_SEARCH_PARAM,
  ) || isStayOnDefaultDomainRemembered();
