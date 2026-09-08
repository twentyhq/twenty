// @vitest-environment jsdom
import { Profiler } from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { RecordingTimer } from '../RecordingTimer';
import { useCompanion } from '../useCompanion';
import { createInitialState } from '../../shared/create-initial-state';
import { type ActiveRecording } from '../../shared/types';

const START = Date.parse('2026-09-08T12:00:00Z');
const recording: ActiveRecording = {
  id: 'recording',
  windowId: 'window',
  title: 'Call',
  startedAt: new Date(START).toISOString(),
  status: 'recording',
};
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  delete window.companion;
});

it('updates elapsed time without rerendering navigation', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(START);
  window.companion = {
    getState: async () => createInitialState(),
    command: vi.fn(),
    onState: () => () => undefined,
    onNavigate: () => () => undefined,
  };
  const navigationRendered = vi.fn();
  const Layout = () => {
    const { page } = useCompanion();
    return (
      <>
        <Profiler id="navigation" onRender={navigationRendered}>
          <nav>{page}</nav>
        </Profiler>
        <RecordingTimer recording={recording} />
      </>
    );
  };
  await act(async () => {
    render(<Layout />);
  });
  navigationRendered.mockClear();
  await act(async () => {
    vi.advanceTimersByTime(5000);
  });
  expect(screen.getByText('00:05')).toBeDefined();
  expect(navigationRendered).not.toHaveBeenCalled();
});

it('freezes while paused and resumes without counting the pause', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(START + 5000);
  const { rerender, unmount } = render(
    <RecordingTimer recording={recording} />,
  );
  rerender(
    <RecordingTimer
      recording={{
        ...recording,
        status: 'paused',
        pausedAt: new Date(START + 5000).toISOString(),
      }}
    />,
  );
  await act(async () => {
    vi.advanceTimersByTime(60_000);
  });
  expect(screen.getByText('00:05')).toBeDefined();
  rerender(
    <RecordingTimer recording={{ ...recording, pausedMilliseconds: 60_000 }} />,
  );
  expect(screen.getByText('00:05')).toBeDefined();
  await act(async () => {
    vi.advanceTimersByTime(1000);
  });
  expect(screen.getByText('00:06')).toBeDefined();
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});
