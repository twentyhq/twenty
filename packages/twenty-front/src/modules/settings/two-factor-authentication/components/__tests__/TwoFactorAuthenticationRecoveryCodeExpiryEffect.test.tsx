import { render } from '@testing-library/react';

import { TwoFactorAuthenticationRecoveryCodeExpiryEffect } from '@/settings/two-factor-authentication/components/TwoFactorAuthenticationRecoveryCodeExpiryEffect';

const ONE_HOUR_MS = 60 * 60 * 1000;

const inOneHour = () => new Date(Date.now() + ONE_HOUR_MS).toISOString();

describe('TwoFactorAuthenticationRecoveryCodeExpiryEffect', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('calls onExpire once the code expires', () => {
    const onExpire = jest.fn();

    render(
      <TwoFactorAuthenticationRecoveryCodeExpiryEffect
        expiresAt={inOneHour()}
        onExpire={onExpire}
      />,
    );

    jest.advanceTimersByTime(ONE_HOUR_MS - 1000);
    expect(onExpire).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1000);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('waits for the newer expiry when a new code replaces the old one', () => {
    const onExpire = jest.fn();
    const { rerender } = render(
      <TwoFactorAuthenticationRecoveryCodeExpiryEffect
        expiresAt={inOneHour()}
        onExpire={onExpire}
      />,
    );

    jest.advanceTimersByTime(ONE_HOUR_MS / 2);
    rerender(
      <TwoFactorAuthenticationRecoveryCodeExpiryEffect
        expiresAt={inOneHour()}
        onExpire={onExpire}
      />,
    );
    jest.advanceTimersByTime(ONE_HOUR_MS / 2);

    expect(onExpire).not.toHaveBeenCalled();
  });

  it('keeps the code visible for a while when the browser clock is ahead of the server', () => {
    const onExpire = jest.fn();

    render(
      <TwoFactorAuthenticationRecoveryCodeExpiryEffect
        expiresAt={new Date(Date.now() - ONE_HOUR_MS).toISOString()}
        onExpire={onExpire}
      />,
    );

    jest.advanceTimersByTime(1000);

    expect(onExpire).not.toHaveBeenCalled();
  });

  it('does not call onExpire after unmounting', () => {
    const onExpire = jest.fn();
    const { unmount } = render(
      <TwoFactorAuthenticationRecoveryCodeExpiryEffect
        expiresAt={inOneHour()}
        onExpire={onExpire}
      />,
    );

    unmount();
    jest.advanceTimersByTime(ONE_HOUR_MS);

    expect(onExpire).not.toHaveBeenCalled();
  });
});
