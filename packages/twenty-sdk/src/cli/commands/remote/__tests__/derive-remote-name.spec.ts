import { deriveRemoteName } from '@/cli/commands/remote/derive-remote-name';

describe('deriveRemoteName', () => {
  it('should use only the subdomain when the host has one', () => {
    expect(deriveRemoteName('https://martin-s-workspace.twenty.com')).toBe(
      'martin-s-workspace',
    );
  });

  it('should join multiple subdomain labels with dashes', () => {
    expect(deriveRemoteName('https://app.staging.twenty.com')).toBe(
      'app-staging',
    );
  });

  it('should drop the tld when there is no subdomain', () => {
    expect(deriveRemoteName('https://twenty.com')).toBe('twenty');
  });

  it('should handle single-label hosts like localhost', () => {
    expect(deriveRemoteName('http://localhost:3000')).toBe('localhost');
  });

  it('should keep IPv4 addresses intact', () => {
    expect(deriveRemoteName('http://127.0.0.1:3000')).toBe('127-0-0-1');
  });

  it('should fall back to "remote" for invalid URLs', () => {
    expect(deriveRemoteName('not a url')).toBe('remote');
  });
});
