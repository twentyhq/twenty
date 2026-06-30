import { getEmailChannelDomain } from '@/settings/accounts/utils/getEmailChannelDomain';

describe('getEmailChannelDomain', () => {
  it('should return the lowercased domain after the last @', () => {
    expect(getEmailChannelDomain('Jane@Example.COM')).toBe('example.com');
  });

  it('should use the domain after the last @ when several are present', () => {
    expect(getEmailChannelDomain('weird@local@Sub.Example.com')).toBe(
      'sub.example.com',
    );
  });

  it('should return undefined when there is no @', () => {
    expect(getEmailChannelDomain('not-an-email')).toBeUndefined();
  });

  it('should return undefined for null or undefined input', () => {
    expect(getEmailChannelDomain(null)).toBeUndefined();
    expect(getEmailChannelDomain(undefined)).toBeUndefined();
  });
});
