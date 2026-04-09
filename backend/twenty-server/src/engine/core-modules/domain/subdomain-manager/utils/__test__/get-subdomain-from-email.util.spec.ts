import { getSubdomainFromEmail } from 'src/engine/core-modules/domain/subdomain-manager/utils/get-subdomain-from-email.util';

describe('getSubdomainFromEmail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return undefined if email is not defined', () => {
    const result = getSubdomainFromEmail(undefined);

    expect(result).toBeUndefined();
  });

  it('should return undefined if email is not a work email', () => {
    const result = getSubdomainFromEmail('test@gmail.com');

    expect(result).toBeUndefined();
  });

  it('should return the domain name if email is valid and a work email', () => {
    const result = getSubdomainFromEmail('test@twenty.com');

    expect(result).toBe('twenty');
  });
});
