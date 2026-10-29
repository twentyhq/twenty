import { SALESFARCE_SESSION_STORAGE_KEY } from '@/salesfarce/constants/SalesfarceSessionStorageKey';
import { salesfarceConsumeRequest } from '@/salesfarce/utils/salesfarceConsumeRequest';

describe('salesfarceConsumeRequest', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it('honors a request once so the next refresh drops Salesfarce', () => {
    sessionStorage.setItem(SALESFARCE_SESSION_STORAGE_KEY, 'true');

    expect(salesfarceConsumeRequest()).toBe(true);
    expect(salesfarceConsumeRequest()).toBe(false);
  });
});
