import { STAY_ON_DEFAULT_DOMAIN_SESSION_STORAGE_KEY } from '@/domain-manager/constants/StayOnDefaultDomainSessionStorageKey';
import { hasStayOnDefaultDomainSearchParam } from '@/domain-manager/utils/hasStayOnDefaultDomainSearchParam';

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
  hasStayOnDefaultDomainSearchParam() || isStayOnDefaultDomainRemembered();
