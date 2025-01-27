import { isDefined } from 'src/utils/is-defined';
import { isWorkEmail } from 'src/utils/is-work-email';
import { getDomainNameByEmail } from 'src/utils/get-domain-name-by-email';
import { getSubdomainFromEmail } from 'src/engine/core-modules/domain-manager/utils/get-subdomain-from-email';

jest.mock('src/utils/is-defined', () => ({
  isDefined: jest.fn(),
}));

jest.mock('src/utils/is-work-email', () => ({
  isWorkEmail: jest.fn(),
}));

jest.mock('src/utils/get-domain-name-by-email', () => ({
  getDomainNameByEmail: jest.fn(),
}));

describe('getSubdomainFromEmail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return undefined if email is not defined', () => {
    (isDefined as unknown as jest.Mock).mockReturnValue(false);

    const result = getSubdomainFromEmail(undefined);

    expect(result).toBeUndefined();
    expect(isDefined).toHaveBeenCalledWith(undefined);
    expect(isWorkEmail).not.toHaveBeenCalled();
    expect(getDomainNameByEmail).not.toHaveBeenCalled();
  });

  it('should return undefined if email is not a work email', () => {
    (isDefined as unknown as jest.Mock).mockReturnValue(true);
    (isWorkEmail as jest.Mock).mockReturnValue(false);

    const result = getSubdomainFromEmail('test@example.com');

    expect(result).toBeUndefined();
    expect(isDefined).toHaveBeenCalledWith('test@example.com');
    expect(isWorkEmail).toHaveBeenCalledWith('test@example.com');
    expect(getDomainNameByEmail).not.toHaveBeenCalled();
  });

  it('should return the domain name if email is valid and a work email', () => {
    (isDefined as unknown as jest.Mock).mockReturnValue(true);
    (isWorkEmail as jest.Mock).mockReturnValue(true);
    (getDomainNameByEmail as jest.Mock).mockReturnValue('subdomain');

    const result = getSubdomainFromEmail('test@subdomain.example.com');

    expect(result).toBe('subdomain');
    expect(isDefined).toHaveBeenCalledWith('test@subdomain.example.com');
    expect(isWorkEmail).toHaveBeenCalledWith('test@subdomain.example.com');
    expect(getDomainNameByEmail).toHaveBeenCalledWith(
      'test@subdomain.example.com',
    );
  });
});
