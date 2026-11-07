import { SALESFARCE_SESSION_STORAGE_KEY } from '@/salesfarce/constants/SalesfarceSessionStorageKey';

export const salesfarceConsumeRequest = () => {
  try {
    const isRequested =
      sessionStorage.getItem(SALESFARCE_SESSION_STORAGE_KEY) === 'true';

    sessionStorage.removeItem(SALESFARCE_SESSION_STORAGE_KEY);

    return isRequested;
  } catch {
    return false;
  }
};
