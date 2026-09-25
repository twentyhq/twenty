import { getIsStayingOnDefaultDomainAfterPageLoad } from '@/domain-manager/utils/getIsStayingOnDefaultDomainAfterPageLoad';

const mockNavigationType = (type: string) => {
  Object.defineProperty(window.performance, 'getEntriesByType', {
    configurable: true,
    value: () => [{ type }],
  });
};

describe('getIsStayingOnDefaultDomainAfterPageLoad', () => {
  beforeEach(() => {
    mockNavigationType('navigate');
  });

  afterEach(() => {
    Reflect.deleteProperty(window.performance, 'getEntriesByType');
  });

  it('stays when the url carries the marker', () => {
    window.history.replaceState(null, '', '/welcome?stayOnDefaultDomain=true');

    expect(
      getIsStayingOnDefaultDomainAfterPageLoad({
        isStayingOnDefaultDomain: false,
      }),
    ).toBe(true);
  });

  it('forgets a previous stay on a plain visit', () => {
    window.history.replaceState(null, '', '/welcome');

    expect(
      getIsStayingOnDefaultDomainAfterPageLoad({
        isStayingOnDefaultDomain: true,
      }),
    ).toBe(false);
  });

  it('keeps a previous stay when social SSO comes back', () => {
    window.history.replaceState(
      null,
      '',
      '/welcome#ssoExchangeToken=sso-exchange-token',
    );

    expect(
      getIsStayingOnDefaultDomainAfterPageLoad({
        isStayingOnDefaultDomain: true,
      }),
    ).toBe(true);
  });

  it('keeps a previous stay across a reload', () => {
    window.history.replaceState(null, '', '/welcome');
    mockNavigationType('reload');

    expect(
      getIsStayingOnDefaultDomainAfterPageLoad({
        isStayingOnDefaultDomain: true,
      }),
    ).toBe(true);
  });

  it('does not start a stay on a reload without the marker', () => {
    window.history.replaceState(null, '', '/welcome');
    mockNavigationType('reload');

    expect(
      getIsStayingOnDefaultDomainAfterPageLoad({
        isStayingOnDefaultDomain: false,
      }),
    ).toBe(false);
  });
});
