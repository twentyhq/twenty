import { afterEach, expect, it, vi } from 'vitest';
import { type CompanionState } from '../../../shared/types/CompanionState';

afterEach(() => {
  vi.unstubAllEnvs();
});

it('interpolates main-process messages in production', async () => {
  vi.stubEnv('NODE_ENV', 'production');
  vi.resetModules();

  const { getTrayTitle } = await import('../getTrayTitle');
  const { TwentyRequestError } =
    await import('../../errors/TwentyRequestError');
  const now = Date.parse('2026-09-07T12:00:00Z');
  const state = {
    activeRecording: null,
    settings: { showMeetingCountdown: true },
    meetings: [
      {
        startsAt: '2026-09-07T13:00:00Z',
        endsAt: '2026-09-07T14:00:00Z',
      },
    ],
  } as CompanionState;

  expect(getTrayTitle(state, now)).toBe('60m');
  expect(
    new TwentyRequestError(404, 'https://api.twenty.com/meetings').message,
  ).toBe('Twenty returned 404 for /meetings. Please try again.');
});
