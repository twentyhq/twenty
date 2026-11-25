import {
  formatExpiration,
  isExpired,
} from '@/settings/developers/utils/formatExpiration';
import { i18n } from '@lingui/core';
import { messages as enMessages } from '~/locales/generated/en';

i18n.load('en', enMessages);
i18n.activate('en');

jest.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

describe('formatExpiration', () => {
  it('should format properly when expiresAt is great', () => {
    const expiresAt = '2044-01-10T00:00:00.000Z';
    const result = formatExpiration(expiresAt);
    expect(result).toEqual('Never');
    const resultWithExpiresMention = formatExpiration(expiresAt, true);
    expect(resultWithExpiresMention).toEqual('Never expires');
  });
  it('should format properly when expiresAt is null', () => {
    const expiresAt = null;
    const result = formatExpiration(expiresAt);
    expect(result).toEqual('Never');
    const resultWithExpiresMention = formatExpiration(expiresAt, true);
    expect(resultWithExpiresMention).toEqual('Never expires');
  });
  it('should format properly when expiresAt is not null', () => {
    const expiresAt = '2024-01-10T00:00:00.000Z';
    const result = formatExpiration(expiresAt);
    expect(result).toEqual('In 9 days');
    const resultWithExpiresMention = formatExpiration(expiresAt, true);
    expect(resultWithExpiresMention).toEqual('Expires in 9 days');
  });
  it('should format properly when expiresAt is large', () => {
    const expiresAt = '2032-01-10T00:00:00.000Z';
    const result = formatExpiration(expiresAt);
    expect(result).toEqual('In 8 years');
    const resultWithExpiresMention = formatExpiration(expiresAt, true);
    expect(resultWithExpiresMention).toEqual('Expires in 8 years');
  });
  it('should format properly when expiresAt is large and long version', () => {
    const expiresAt = '2032-01-10T00:00:00.000Z';
    const result = formatExpiration(expiresAt, undefined, false);
    expect(result).toEqual('In 8 years and 9 days');
    const resultWithExpiresMention = formatExpiration(expiresAt, true, false);
    expect(resultWithExpiresMention).toEqual('Expires in 8 years and 9 days');
  });
  it('should format properly when expiresAt is less than a day away', () => {
    const expiresAt = '2024-01-01T06:00:00.000Z';
    expect(formatExpiration(expiresAt)).toEqual('In less than a day');
    expect(formatExpiration(expiresAt, true)).toEqual(
      'Expires in less than a day',
    );
    expect(formatExpiration(expiresAt, true, false)).toEqual(
      'Expires in less than a day',
    );
  });
  it('should format properly when expiresAt passed less than a day ago', () => {
    const expiresAt = '2023-12-31T21:00:00.000Z';
    expect(formatExpiration(expiresAt)).toEqual('Expired');
    expect(formatExpiration(expiresAt, true, false)).toEqual('Expired');
  });
  it('should format properly when expiresAt passed several days ago', () => {
    const expiresAt = '2023-12-22T00:00:00.000Z';
    expect(formatExpiration(expiresAt)).toEqual('Expired');
    expect(formatExpiration(expiresAt, true, false)).toEqual('Expired');
  });
});

describe('isExpired', () => {
  it('should return false for future dates', () => {
    const expiresAt = '2024-01-10T00:00:00.000Z';
    expect(isExpired(expiresAt)).toBe(false);
  });

  it('should return true for past dates', () => {
    const expiresAt = '2023-12-01T00:00:00.000Z';
    expect(isExpired(expiresAt)).toBe(true);
  });

  it('should return true for dates passed less than a day ago', () => {
    const expiresAt = '2023-12-31T21:00:00.000Z';
    expect(isExpired(expiresAt)).toBe(true);
  });

  it('should return false for dates less than a day away', () => {
    const expiresAt = '2024-01-01T06:00:00.000Z';
    expect(isExpired(expiresAt)).toBe(false);
  });

  it('should return false for null dates', () => {
    expect(isExpired(null)).toBe(false);
  });

  it('should return false for never expiring dates', () => {
    const expiresAt = '2044-01-10T00:00:00.000Z';
    expect(isExpired(expiresAt)).toBe(false);
  });
});
