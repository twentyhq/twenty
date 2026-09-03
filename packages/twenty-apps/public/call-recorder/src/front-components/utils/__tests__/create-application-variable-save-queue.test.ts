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
      .fn<(value: string) => Promise<void>>()
      .mockReturnValueOnce(firstSave.promise)
      .mockReturnValueOnce(latestSave.promise);
    const { enqueueSave } = createApplicationVariableSaveQueue({ saveValue });

    enqueueSave('first');
    enqueueSave('second');
    enqueueSave('latest');

    expect(saveValue).toHaveBeenCalledTimes(1);
    expect(saveValue).toHaveBeenNthCalledWith(1, 'first');

    firstSave.resolvePromise();
    await firstSave.promise;
    await Promise.resolve();

    expect(saveValue).toHaveBeenCalledTimes(2);
    expect(saveValue).toHaveBeenNthCalledWith(2, 'latest');

    latestSave.resolvePromise();
    await latestSave.promise;
  });
});
