import { createLivenessWatchdog } from '@/ai/dictation/utils/createLivenessWatchdog';

describe('createLivenessWatchdog', () => {
  const TIMEOUT_IN_MS = 2500;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('reports silence when nothing happens before the timeout', () => {
    const onSilent = jest.fn();
    const watchdog = createLivenessWatchdog({
      timeoutInMs: TIMEOUT_IN_MS,
      onSilent,
    });

    watchdog.arm();
    jest.advanceTimersByTime(TIMEOUT_IN_MS);

    expect(onSilent).toHaveBeenCalledTimes(1);
  });

  it('stays quiet when activity arrives in time', () => {
    const onSilent = jest.fn();
    const watchdog = createLivenessWatchdog({
      timeoutInMs: TIMEOUT_IN_MS,
      onSilent,
    });

    watchdog.arm();
    jest.advanceTimersByTime(TIMEOUT_IN_MS - 1);
    watchdog.noteActivity();
    jest.advanceTimersByTime(TIMEOUT_IN_MS * 2);

    expect(onSilent).not.toHaveBeenCalled();
  });

  it('stays quiet after being disarmed', () => {
    const onSilent = jest.fn();
    const watchdog = createLivenessWatchdog({
      timeoutInMs: TIMEOUT_IN_MS,
      onSilent,
    });

    watchdog.arm();
    watchdog.disarm();
    jest.advanceTimersByTime(TIMEOUT_IN_MS * 2);

    expect(onSilent).not.toHaveBeenCalled();
  });

  // A second session must be judged on its own silence, not excused by the
  // activity of the one before it.
  it('forgets activity from a previous session when re-armed', () => {
    const onSilent = jest.fn();
    const watchdog = createLivenessWatchdog({
      timeoutInMs: TIMEOUT_IN_MS,
      onSilent,
    });

    watchdog.arm();
    watchdog.noteActivity();

    watchdog.arm();
    jest.advanceTimersByTime(TIMEOUT_IN_MS);

    expect(onSilent).toHaveBeenCalledTimes(1);
  });

  it('does not stack timers when armed twice', () => {
    const onSilent = jest.fn();
    const watchdog = createLivenessWatchdog({
      timeoutInMs: TIMEOUT_IN_MS,
      onSilent,
    });

    watchdog.arm();
    jest.advanceTimersByTime(TIMEOUT_IN_MS - 100);
    watchdog.arm();
    jest.advanceTimersByTime(TIMEOUT_IN_MS);

    expect(onSilent).toHaveBeenCalledTimes(1);
  });
});
