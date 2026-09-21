import { describe, expect, it, vi } from 'vitest';

import { createApplicationVariableSaveQueue } from 'src/front-components/utils/create-application-variable-save-queue.util';

const createDeferredPromise = () => {
  let resolvePromise: () => void = () => {};
  const promise = new Promise<void>((resolve) => {
    resolvePromise = resolve;
  });

  return { promise, resolvePromise };
};

describe('createApplicationVariableSaveQueue', () => {
  it('persists one value at a time and coalesces queued values to the latest', async () => {
    const firstSave = createDeferredPromise();
    const latestSave = createDeferredPromise();
    const saveValue = vi
      .fn<(value: string, isSupersededValue: () => boolean) => Promise<void>>()
      .mockReturnValueOnce(firstSave.promise)
      .mockReturnValueOnce(latestSave.promise);
    const { enqueueSave } = createApplicationVariableSaveQueue({ saveValue });

    enqueueSave('first');
    enqueueSave('second');
    enqueueSave('latest');

    expect(saveValue).toHaveBeenCalledTimes(1);
    expect(saveValue).toHaveBeenNthCalledWith(1, 'first', expect.any(Function));

    firstSave.resolvePromise();
    await firstSave.promise;
    await Promise.resolve();

    expect(saveValue).toHaveBeenCalledTimes(2);
    expect(saveValue).toHaveBeenNthCalledWith(
      2,
      'latest',
      expect.any(Function),
    );

    latestSave.resolvePromise();
    await latestSave.promise;
  });

  it('reports a value as superseded only while a newer one is queued', async () => {
    const firstSave = createDeferredPromise();
    const supersededByValue: Record<string, boolean> = {};
    const saveValue = vi
      .fn<(value: string, isSupersededValue: () => boolean) => Promise<void>>()
      .mockImplementation(async (value, isSupersededValue) => {
        if (value === 'first') {
          await firstSave.promise;
        }

        supersededByValue[value] = isSupersededValue();
      });
    const { enqueueSave } = createApplicationVariableSaveQueue({ saveValue });

    enqueueSave('first');
    enqueueSave('latest');

    firstSave.resolvePromise();
    await firstSave.promise;
    await Promise.resolve();
    await Promise.resolve();

    expect(supersededByValue).toEqual({ first: true, latest: false });
  });
});
