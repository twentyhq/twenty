import { describe, expect, it, vi } from 'vitest';

import { createSettingsSaveQueue } from 'src/front-components/utils/create-settings-save-queue.util';

const createDeferredSave = (view: string[]) => {
  let resolve: () => void = () => undefined;
  let reject: () => void = () => undefined;
  const response = new Promise<string[]>((resolvePromise, rejectPromise) => {
    resolve = () => resolvePromise(view);
    reject = () => rejectPromise(new Error('save failed'));
  });

  return { save: () => response, resolve, reject };
};

const waitForPendingCallbacks = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

describe('createSettingsSaveQueue', () => {
  it('shows only the answer to the last of three selections made before the first one is saved', async () => {
    const queue = createSettingsSaveQueue<string[]>();
    const onSaved = vi.fn();
    const onFailed = vi.fn();
    const saves = [['a'], ['a', 'b'], ['a', 'b', 'c']].map(createDeferredSave);

    const lastSave = saves.map(({ save }) =>
      queue.enqueue({ save, onSaved, onFailed }),
    )[2];

    saves[0].resolve();
    await waitForPendingCallbacks();
    saves[1].resolve();
    await waitForPendingCallbacks();
    expect(onSaved).not.toHaveBeenCalled();
    expect(queue.hasPendingSave()).toBe(true);
    saves[2].resolve();
    await lastSave;

    expect(onSaved).toHaveBeenCalledExactlyOnceWith(['a', 'b', 'c']);
    expect(queue.hasPendingSave()).toBe(false);
  });

  it('sends the saves one after the other', async () => {
    const queue = createSettingsSaveQueue<string[]>();
    const first = createDeferredSave(['a']);
    const secondSave = vi.fn().mockResolvedValue(['a', 'b']);

    queue.enqueue({ save: first.save, onSaved: vi.fn(), onFailed: vi.fn() });
    const lastSave = queue.enqueue({
      save: secondSave,
      onSaved: vi.fn(),
      onFailed: vi.fn(),
    });

    await Promise.resolve();
    expect(secondSave).not.toHaveBeenCalled();

    first.resolve();
    await lastSave;
    expect(secondSave).toHaveBeenCalledOnce();
  });

  it('tells a failed save whether a newer one is still waiting', async () => {
    const queue = createSettingsSaveQueue<string[]>();
    const onFailed = vi.fn();
    const failing = createDeferredSave(['a']);
    const last = createDeferredSave(['a', 'b']);
    const onSaved = vi.fn();

    queue.enqueue({ save: failing.save, onSaved, onFailed });
    const lastSave = queue.enqueue({ save: last.save, onSaved, onFailed });

    failing.reject();
    last.resolve();
    await lastSave;

    expect(onFailed).toHaveBeenCalledExactlyOnceWith(true);
    expect(onSaved).toHaveBeenCalledExactlyOnceWith(['a', 'b']);
  });
});
