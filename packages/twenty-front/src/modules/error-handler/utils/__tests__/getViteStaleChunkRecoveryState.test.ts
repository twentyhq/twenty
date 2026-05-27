import { getViteStaleChunkRecoveryState } from '@/error-handler/utils/getViteStaleChunkRecoveryState';

describe('getViteStaleChunkRecoveryState', () => {
  it('should request a reload when stale chunk happened outside a reload navigation', () => {
    const recoveryState = getViteStaleChunkRecoveryState('navigate');

    expect(recoveryState).toEqual({
      shouldReload: true,
      retryCount: 1,
    });
  });

  it('should stop automatic reload when stale chunk already happened on a reloaded page', () => {
    const recoveryState = getViteStaleChunkRecoveryState('reload');

    expect(recoveryState).toEqual({
      shouldReload: false,
      retryCount: 2,
    });
  });

  it('should default to one recovery attempt when navigation type is unavailable', () => {
    const recoveryState = getViteStaleChunkRecoveryState(undefined);

    expect(recoveryState).toEqual({
      shouldReload: true,
      retryCount: 1,
    });
  });
});
