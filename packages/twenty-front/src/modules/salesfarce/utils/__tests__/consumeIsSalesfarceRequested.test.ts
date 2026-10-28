import { SALESFARCE_SESSION_STORAGE_KEY } from '@/salesfarce/constants/SalesfarceSessionStorageKey';
import { consumeIsSalesfarceRequested } from '@/salesfarce/utils/consumeIsSalesfarceRequested';

describe('consumeIsSalesfarceRequested', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it('honors a request once so the next refresh drops Salesfarce', () => {
    sessionStorage.setItem(SALESFARCE_SESSION_STORAGE_KEY, 'true');

    expect(consumeIsSalesfarceRequested()).toBe(true);
    expect(consumeIsSalesfarceRequested()).toBe(false);
  });
});
