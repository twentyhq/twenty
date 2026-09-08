import { afterEach, expect, it, vi } from 'vitest';
import { createDevelopmentRestart } from '../development-restart';

let dispose: (() => void) | undefined;
afterEach(() => {
  dispose?.();
  vi.useRealTimers();
});

it('restarts immediately while idle and coalesces repeated requests', () => {
  vi.useFakeTimers();
  const restart = vi.fn();
  const controller = createDevelopmentRestart(() => false, restart);
  dispose = controller.dispose;
  controller.request();
  controller.request();
  expect(restart).toHaveBeenCalledOnce();
  expect(vi.getTimerCount()).toBe(0);
});

it('waits through capture startup, recording, pause, and finishing', () => {
  vi.useFakeTimers();
  let busy = true;
  const restart = vi.fn();
  const controller = createDevelopmentRestart(() => busy, restart);
  dispose = controller.dispose;
  controller.request();
  for (let build = 0; build < 3; build++) {
    controller.request();
    vi.advanceTimersByTime(30_000);
  }
  expect(restart).not.toHaveBeenCalled();
  expect(vi.getTimerCount()).toBe(1);
  busy = false;
  vi.advanceTimersByTime(250);
  expect(restart).toHaveBeenCalledOnce();
  expect(vi.getTimerCount()).toBe(0);
});

it('cancels a pending restart on disposal', () => {
  vi.useFakeTimers();
  const restart = vi.fn();
  const controller = createDevelopmentRestart(() => true, restart);
  dispose = controller.dispose;
  controller.request();
  controller.dispose();
  vi.advanceTimersByTime(1000);
  expect(restart).not.toHaveBeenCalled();
  expect(vi.getTimerCount()).toBe(0);
});
