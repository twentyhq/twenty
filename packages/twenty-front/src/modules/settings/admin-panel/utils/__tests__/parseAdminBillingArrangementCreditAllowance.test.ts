import { parseAdminBillingArrangementCreditAllowance } from '@/settings/admin-panel/utils/parseAdminBillingArrangementCreditAllowance';

describe('parseAdminBillingArrangementCreditAllowance', () => {
  it.each([
    ['50', 50],
    ['12.5', 12.5],
    ['0', 0],
  ])('should parse %p', (value, expected) => {
    expect(parseAdminBillingArrangementCreditAllowance(value)).toBe(expected);
  });

  it.each(['', '   ', '-1', 'abc', 'Infinity'])('should refuse %p', (value) => {
    expect(parseAdminBillingArrangementCreditAllowance(value)).toBeNull();
  });
});
