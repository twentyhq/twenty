import { act, renderHook } from '@testing-library/react';

import { useGeneratedRecoveryCode } from '@/settings/two-factor-authentication/hooks/useGeneratedRecoveryCode';

const ONE_HOUR_MS = 60 * 60 * 1000;

const buildRecoveryCode = (recoveryCode: string) => ({
  recoveryCode,
  expiresAt: new Date(Date.now() + ONE_HOUR_MS).toISOString(),
});

describe('useGeneratedRecoveryCode', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('hides the code once it expires', () => {
    const { result } = renderHook(() => useGeneratedRecoveryCode());
    const recoveryCode = buildRecoveryCode('AAAAA-BBBBB-CCCCC-DDDDD');

    act(() => result.current.showGeneratedRecoveryCode(recoveryCode));

    expect(result.current.generatedRecoveryCode).toBe(recoveryCode);

    act(() => jest.advanceTimersByTime(ONE_HOUR_MS));

    expect(result.current.generatedRecoveryCode).toBeNull();
  });

  it('keeps a newer code when an older one expires', () => {
    const { result } = renderHook(() => useGeneratedRecoveryCode());

    act(() =>
      result.current.showGeneratedRecoveryCode(
        buildRecoveryCode('AAAAA-BBBBB-CCCCC-DDDDD'),
      ),
    );
    act(() => jest.advanceTimersByTime(ONE_HOUR_MS / 2));

    const newerRecoveryCode = buildRecoveryCode('EEEEE-FFFFF-GGGGG-HHHHH');

    act(() => result.current.showGeneratedRecoveryCode(newerRecoveryCode));
    act(() => jest.advanceTimersByTime(ONE_HOUR_MS / 2));

    expect(result.current.generatedRecoveryCode).toBe(newerRecoveryCode);
  });

  it('keeps the code visible for a while when the browser clock is ahead of the server', () => {
    const { result } = renderHook(() => useGeneratedRecoveryCode());
    const recoveryCode = {
      recoveryCode: 'AAAAA-BBBBB-CCCCC-DDDDD',
      expiresAt: new Date(Date.now() - ONE_HOUR_MS).toISOString(),
    };

    act(() => result.current.showGeneratedRecoveryCode(recoveryCode));
    act(() => jest.advanceTimersByTime(1000));

    expect(result.current.generatedRecoveryCode).toBe(recoveryCode);
  });
});
