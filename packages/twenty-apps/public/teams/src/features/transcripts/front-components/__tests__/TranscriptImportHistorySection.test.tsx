// @vitest-environment jsdom

import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TranscriptImportHistorySection } from 'src/features/transcripts/front-components/TranscriptImportHistorySection';

const { postMock, enqueueSnackbarMock, translate } = vi.hoisted(() => ({
  postMock: vi.fn(),
  enqueueSnackbarMock: vi.fn(),
  translate: (message: string, values?: Record<string, unknown>) =>
    message.replace(/\{(\w+)\}/g, (_, key: string) => String(values?.[key])),
}));

vi.mock('twenty-sdk/front-component', () => ({
  useTranslate: () => ({ t: translate, locale: 'en' }),
  t: translate,
  enqueueSnackbar: enqueueSnackbarMock,
}));

vi.mock('twenty-client-sdk/rest', () => ({
  RestApiClient: class {
    post = postMock;
  },
}));

const BASE_STATE = {
  runId: 'run-1',
  days: 90,
  windowStart: '2026-06-17T00:00:00.000Z',
  windowEnd: '2026-09-15T00:00:00.000Z',
  transcriptCount: 0,
  alreadyImportedCount: 0,
  deletedCount: 0,
  pageCount: 0,
  importedCount: 0,
  skippedCount: 0,
  unavailableCount: 0,
  updatedAt: '2026-09-15T00:00:00.000Z',
};

const COUNTED_STATE = {
  ...BASE_STATE,
  phase: 'counted',
  transcriptCount: 40,
  alreadyImportedCount: 12,
  deletedCount: 3,
  pageCount: 7,
};

const toSuccess = (state: unknown) => ({
  success: true,
  state,
  isStalled: false,
});

const countCalls = (routeSuffix: string) =>
  postMock.mock.calls.filter(([path]) => path.endsWith(routeSuffix)).length;

const advanceTime = async (milliseconds = 0) => {
  let remainingMilliseconds = milliseconds;

  do {
    const stepMilliseconds = Math.min(500, remainingMilliseconds);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(stepMilliseconds);
    });
    remainingMilliseconds -= stepMilliseconds;
  } while (remainingMilliseconds > 0);
};

const getCountButton = () =>
  screen.getByRole('button', { name: 'Count transcripts' });

describe('TranscriptImportHistorySection', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    postMock.mockReset();
    enqueueSnackbarMock.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('should count the transcripts, then import them once', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    postMock.mockImplementation(async (path: string) => {
      if (path.endsWith('/count')) {
        return toSuccess({ ...BASE_STATE, phase: 'counting' });
      }

      if (path.endsWith('/import')) {
        return toSuccess({ ...COUNTED_STATE, phase: 'importing' });
      }

      return countCalls('/status') === 1
        ? toSuccess(null)
        : toSuccess(COUNTED_STATE);
    });

    render(<TranscriptImportHistorySection />);
    await advanceTime();
    await user.click(getCountButton());
    await advanceTime();

    expect(screen.getByText('Counting transcripts...')).toBeTruthy();

    await advanceTime(5_000);

    expect(screen.getByText('To import: 25')).toBeTruthy();

    await user.dblClick(
      screen.getByRole('button', { name: 'Import transcripts' }),
    );
    await advanceTime();

    expect(countCalls('/import')).toBe(1);
    expect(screen.getByText('Imported 0 of 25')).toBeTruthy();
  });

  it('should stop polling and offer Retry when the connection is gone', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    postMock.mockImplementation(async () =>
      countCalls('/status') === 1
        ? toSuccess({ ...BASE_STATE, phase: 'counting' })
        : { success: false, errorCode: 'not-connected' },
    );

    render(<TranscriptImportHistorySection />);
    await advanceTime();
    await advanceTime(10 * 60_000);

    expect(countCalls('/status')).toBe(2);
    expect(
      screen.getByText(
        'Add your own Microsoft Teams connection to import its history.',
      ),
    ).toBeTruthy();

    postMock.mockResolvedValue(toSuccess(COUNTED_STATE));
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    await advanceTime();

    expect(screen.getByText('To import: 25')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull();
  });

  it('should keep polling a running import through an unexpected failure without offering a count', async () => {
    postMock.mockImplementation(async () =>
      countCalls('/status') === 2
        ? { success: false, errorCode: 'unknown' }
        : toSuccess({ ...COUNTED_STATE, phase: 'importing' }),
    );

    render(<TranscriptImportHistorySection />);
    await advanceTime();
    await advanceTime(30_000);

    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
    expect(
      screen.queryByRole('button', { name: 'Count transcripts' }),
    ).toBeNull();

    await advanceTime(30_000);

    expect(countCalls('/status')).toBe(3);
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull();
    expect(screen.getByText('Importing transcripts...')).toBeTruthy();
  });

  it('should ignore a status reply sent before a count started', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const countingState = {
      ...BASE_STATE,
      runId: 'run-2',
      days: 30,
      phase: 'counting',
    };
    let resolveLateStatus: (value: unknown) => void = () => undefined;

    postMock.mockImplementation(async (path: string) => {
      if (path.endsWith('/count')) {
        return toSuccess(countingState);
      }

      if (path.endsWith('/import')) {
        return { success: false, errorCode: 'unknown' };
      }

      switch (countCalls('/status')) {
        case 1:
          return toSuccess(COUNTED_STATE);
        case 2:
          return { success: false, errorCode: 'unknown' };
        case 3:
          return new Promise((resolve) => {
            resolveLateStatus = resolve;
          });
        default:
          return toSuccess(countingState);
      }
    });

    render(<TranscriptImportHistorySection />);
    await advanceTime();
    await user.click(
      screen.getByRole('button', { name: 'Import transcripts' }),
    );
    await advanceTime();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    await advanceTime();

    const daysInput = screen.getByRole('spinbutton', { name: 'Days to count' });

    await user.clear(daysInput);
    await user.type(daysInput, '30');
    await user.click(getCountButton());
    await advanceTime();
    await act(async () => {
      resolveLateStatus(toSuccess(COUNTED_STATE));
    });
    await advanceTime();

    expect(screen.getByText('Counting transcripts...')).toBeTruthy();
    expect(screen.queryByText('Last 90 days')).toBeNull();

    await advanceTime(5_000);

    expect(countCalls('/status')).toBe(4);
  });

  it('should only count a whole number of days between 1 and 365', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    postMock.mockResolvedValue(toSuccess(null));

    render(<TranscriptImportHistorySection />);
    await advanceTime();

    const daysInput = screen.getByRole('spinbutton', { name: 'Days to count' });

    for (const days of ['', '0', '366', '1.5']) {
      await user.clear(daysInput);

      if (days !== '') {
        await user.type(daysInput, days);
      }

      expect(getCountButton().hasAttribute('disabled')).toBe(true);
    }

    await user.clear(daysInput);
    await user.type(daysInput, '365');

    expect(getCountButton().hasAttribute('disabled')).toBe(false);
  });
});
