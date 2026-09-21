import { isStayOnDefaultDomainRequested } from '@/domain-manager/utils/isStayOnDefaultDomainRequested';
import { rememberStayOnDefaultDomainRequest } from '@/domain-manager/utils/rememberStayOnDefaultDomainRequest';

describe('isStayOnDefaultDomainRequested', () => {
  beforeEach(() => {
    sessionStorage.clear();
    window.history.replaceState(null, '', '/welcome');
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
});
