import { forgetStayOnDefaultDomainRequest } from '@/domain-manager/utils/forgetStayOnDefaultDomainRequest';
import { isStayOnDefaultDomainRequested } from '@/domain-manager/utils/isStayOnDefaultDomainRequested';
import { rememberStayOnDefaultDomainRequest } from '@/domain-manager/utils/rememberStayOnDefaultDomainRequest';

describe('isStayOnDefaultDomainRequested', () => {
  beforeEach(() => {
    sessionStorage.clear();
    window.history.replaceState(null, '', '/welcome');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('is false on a plain visit to the default domain', () => {
    expect(isStayOnDefaultDomainRequested()).toBe(false);
  });

  it('is true when the url carries the marker', () => {
    window.history.replaceState(null, '', '/welcome?stayOnDefaultDomain=true');

    expect(isStayOnDefaultDomainRequested()).toBe(true);
  });

  it('stays true once remembered, after social SSO drops the url marker', () => {
    window.history.replaceState(null, '', '/welcome?stayOnDefaultDomain=true');
    rememberStayOnDefaultDomainRequest();

    window.history.replaceState(null, '', '/welcome');

    expect(isStayOnDefaultDomainRequested()).toBe(true);
  });

  it('remembers nothing when the url carries no marker', () => {
    rememberStayOnDefaultDomainRequest();

    expect(isStayOnDefaultDomainRequested()).toBe(false);
  });

  it('is false again once the visit ends on a workspace', () => {
    window.history.replaceState(null, '', '/welcome?stayOnDefaultDomain=true');
    rememberStayOnDefaultDomainRequest();

    forgetStayOnDefaultDomainRequest();
    window.history.replaceState(null, '', '/welcome');

    expect(isStayOnDefaultDomainRequested()).toBe(false);
  });

  it('falls back to the url marker when storage is unavailable', () => {
    const throwSecurityError = () => {
      throw new DOMException('Storage is disabled', 'SecurityError');
    };
    jest
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(throwSecurityError);
    jest
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(throwSecurityError);
    jest
      .spyOn(Storage.prototype, 'removeItem')
      .mockImplementation(throwSecurityError);

    expect(isStayOnDefaultDomainRequested()).toBe(false);
    expect(() => forgetStayOnDefaultDomainRequest()).not.toThrow();

    window.history.replaceState(null, '', '/welcome?stayOnDefaultDomain=true');

    expect(() => rememberStayOnDefaultDomainRequest()).not.toThrow();
    expect(isStayOnDefaultDomainRequested()).toBe(true);
  });
});
