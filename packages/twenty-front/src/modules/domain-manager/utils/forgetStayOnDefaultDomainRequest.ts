import { STAY_ON_DEFAULT_DOMAIN_SESSION_STORAGE_KEY } from '@/domain-manager/constants/StayOnDefaultDomainSessionStorageKey';

export const forgetStayOnDefaultDomainRequest = () => {
  sessionStorage.removeItem(STAY_ON_DEFAULT_DOMAIN_SESSION_STORAGE_KEY);
};
