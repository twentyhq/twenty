import { atom, createStore } from 'jotai';

import { waitForAtomValue } from '@/captcha/utils/waitForAtomValue';

describe('waitForAtomValue', () => {
  const isReadyAtom = atom(false);
  const isReady = (value: boolean) => value;

  it('should resolve immediately when the value is already expected', async () => {
    const store = createStore();
    store.set(isReadyAtom, true);

    await expect(
      waitForAtomValue({
        store,
        atom: isReadyAtom,
        isExpectedValue: isReady,
        abortSignal: new AbortController().signal,
      }),
    ).resolves.toBeUndefined();
  });

  it('should resolve once the value becomes expected', async () => {
    const store = createStore();
    const handleResolved = jest.fn();

    const pendingWait = waitForAtomValue({
      store,
      atom: isReadyAtom,
      isExpectedValue: isReady,
      abortSignal: new AbortController().signal,
    }).then(handleResolved);

    await Promise.resolve();
    expect(handleResolved).not.toHaveBeenCalled();

    store.set(isReadyAtom, true);
    await pendingWait;

    expect(handleResolved).toHaveBeenCalledTimes(1);
  });

  it('should reject and stop listening when aborted', async () => {
    const store = createStore();
    const abortController = new AbortController();
    const isExpectedValue = jest.fn(isReady);

    const pendingWait = waitForAtomValue({
      store,
      atom: isReadyAtom,
      isExpectedValue,
      abortSignal: abortController.signal,
    });

    abortController.abort();

    await expect(pendingWait).rejects.toThrow(
      'Aborted while waiting for atom value',
    );

    isExpectedValue.mockClear();
    store.set(isReadyAtom, true);

    expect(isExpectedValue).not.toHaveBeenCalled();
  });
});
