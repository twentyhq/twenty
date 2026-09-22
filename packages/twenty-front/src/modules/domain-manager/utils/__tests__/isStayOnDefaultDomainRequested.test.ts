import { forgetStayOnDefaultDomainRequest } from '@/domain-manager/utils/forgetStayOnDefaultDomainRequest';
import { isStayOnDefaultDomainRequested } from '@/domain-manager/utils/isStayOnDefaultDomainRequested';
import { syncStayOnDefaultDomainRequest } from '@/domain-manager/utils/syncStayOnDefaultDomainRequest';

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
    syncStayOnDefaultDomainRequest();

    window.history.replaceState(null, '', '/welcome');

    expect(isStayOnDefaultDomainRequested()).toBe(true);
  });

  it('remembers nothing when the url carries no marker', () => {
    syncStayOnDefaultDomainRequest();

    expect(isStayOnDefaultDomainRequested()).toBe(false);
  });

  it('forgets the remembered request on a later plain page load', () => {
    window.history.replaceState(null, '', '/welcome?stayOnDefaultDomain=true');
    syncStayOnDefaultDomainRequest();

    window.history.replaceState(null, '', '/welcome');
    syncStayOnDefaultDomainRequest();

    expect(isStayOnDefaultDomainRequested()).toBe(false);
  });

  it('keeps the remembered request when social SSO comes back', () => {
    window.history.replaceState(null, '', '/welcome?stayOnDefaultDomain=true');
    syncStayOnDefaultDomainRequest();

    window.history.replaceState(
      null,
      '',
      '/welcome#ssoExchangeToken=sso-exchange-token',
    );
    syncStayOnDefaultDomainRequest();

    expect(isStayOnDefaultDomainRequested()).toBe(true);
  });

  it('keeps the remembered request across a reload', () => {
    window.history.replaceState(null, '', '/welcome?stayOnDefaultDomain=true');
    syncStayOnDefaultDomainRequest();

    // jsdom has no navigation timing entries
    Object.defineProperty(window.performance, 'getEntriesByType', {
      configurable: true,
      value: () => [{ type: 'reload' }],
    });
    window.history.replaceState(null, '', '/welcome');
    syncStayOnDefaultDomainRequest();
    Reflect.deleteProperty(window.performance, 'getEntriesByType');

    expect(isStayOnDefaultDomainRequested()).toBe(true);
  });

  it('is false again once the visit ends on a workspace', () => {
    window.history.replaceState(null, '', '/welcome?stayOnDefaultDomain=true');
    syncStayOnDefaultDomainRequest();

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

    expect(() => syncStayOnDefaultDomainRequest()).not.toThrow();
    expect(isStayOnDefaultDomainRequested()).toBe(true);
  });
});
