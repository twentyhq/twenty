import { reloadOnceForAuthProxyRedirect } from '@/apollo/utils/reloadOnceForAuthProxyRedirect';
import { reloadWindow } from '~/utils/reloadWindow';

jest.mock('~/utils/reloadWindow', () => ({
  reloadWindow: jest.fn(),
}));

describe('reloadOnceForAuthProxyRedirect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should reload when the proxy session is first found expired', () => {
    reloadOnceForAuthProxyRedirect();

    expect(reloadWindow).toHaveBeenCalledTimes(1);
  });

  it('should reload only once per tab so a reload that does not restore the session cannot loop', () => {
    reloadOnceForAuthProxyRedirect();
    reloadOnceForAuthProxyRedirect();
    reloadOnceForAuthProxyRedirect();

    expect(reloadWindow).toHaveBeenCalledTimes(1);
  });

  it('should not reload when session storage is unavailable and the guard cannot be recorded', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('session storage unavailable');
    });

    reloadOnceForAuthProxyRedirect();

    expect(reloadWindow).not.toHaveBeenCalled();
  });
});
