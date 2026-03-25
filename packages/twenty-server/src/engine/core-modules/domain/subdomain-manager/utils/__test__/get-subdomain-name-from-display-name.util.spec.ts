import { getSubdomainNameFromDisplayName } from 'src/engine/core-modules/domain/subdomain-manager/utils/get-subdomain-name-from-display-name.util';

describe('getSubdomainNameFromDisplayName', () => {
  it('should return a hyphen-separated, lowercase subdomain name without spaces for a valid display name', () => {
    const result = getSubdomainNameFromDisplayName('My Display Name 123');

    expect(result).toBe('my-display-name-123');
  });

  it('should return undefined if displayName is undefined', () => {
    const result = getSubdomainNameFromDisplayName(undefined);

    expect(result).toBeUndefined();
  });

  it('should handle display names with special characters by removing them but keeping words and numbers', () => {
    const result = getSubdomainNameFromDisplayName('Hello!@# World$%^ 2023');

    expect(result).toBe('hello-world-2023');
  });

  it('should return a single word in lowercase if displayName consists of one valid word', () => {
    const result = getSubdomainNameFromDisplayName('SingleWord');

    expect(result).toBe('singleword');
  });

  it('should return undefined when displayName contains only special characters', () => {
    const result = getSubdomainNameFromDisplayName('!@#$%^&*()');

    expect(result).toBeUndefined();
  });

  it('should handle display names with multiple spaces by removing them', () => {
    const result = getSubdomainNameFromDisplayName(
      '   Spaced   Out    Name   ',
    );

    expect(result).toBe('spaced-out-name');
  });
});
