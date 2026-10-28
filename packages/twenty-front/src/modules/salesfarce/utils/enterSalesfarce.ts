import { SALESFARCE_SESSION_STORAGE_KEY } from '@/salesfarce/constants/SalesfarceSessionStorageKey';
import { reloadWindow } from '~/utils/reloadWindow';

export const enterSalesfarce = () => {
  try {
    sessionStorage.setItem(SALESFARCE_SESSION_STORAGE_KEY, 'true');
  } catch {
    return;
  }

  reloadWindow();
};
