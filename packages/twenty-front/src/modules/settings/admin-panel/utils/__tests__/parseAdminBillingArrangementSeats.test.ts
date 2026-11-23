import { parseAdminBillingArrangementSeats } from '@/settings/admin-panel/utils/parseAdminBillingArrangementSeats';

describe('parseAdminBillingArrangementSeats', () => {
  it('should parse a positive whole number', () => {
    expect(parseAdminBillingArrangementSeats('12')).toBe(12);
  });

  it.each(['', '0', '-3', '2.5', 'ten'])('should refuse %p', (value) => {
    expect(parseAdminBillingArrangementSeats(value)).toBeNull();
  });
});
