import { formatAdminBillingArrangementOperator } from '@/settings/admin-panel/utils/formatAdminBillingArrangementOperator';

describe('formatAdminBillingArrangementOperator', () => {
  it('should show the full name with the email', () => {
    expect(
      formatAdminBillingArrangementOperator({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@twenty.com',
      }),
    ).toBe('Ada Lovelace (ada@twenty.com)');
  });

  it('should fall back to the email when the name is empty', () => {
    expect(
      formatAdminBillingArrangementOperator({
        firstName: '',
        lastName: null,
        email: 'ada@twenty.com',
      }),
    ).toBe('ada@twenty.com');
  });
});
