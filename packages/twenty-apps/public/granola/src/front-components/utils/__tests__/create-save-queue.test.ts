import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createSaveQueue } from 'src/front-components/utils/create-save-queue.util';

describe('createSaveQueue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('serializes saves and replaces pending values with the latest selection', async () => {
    const saveValue = vi.fn(
      async (_value: string[], _isSupersededValue: () => boolean) => {
        await new Promise<void>((resolve) => setTimeout(resolve, 100));
      },
    );
    const { enqueueSave } = createSaveQueue({ saveValue });

    enqueueSave(['first']);

    const isFirstValueSuperseded = saveValue.mock.calls[0][1];

    expect(isFirstValueSuperseded()).toBe(false);

    enqueueSave(['second']);
    enqueueSave(['latest']);

    expect(saveValue).toHaveBeenCalledTimes(1);
    expect(isFirstValueSuperseded()).toBe(true);

    await vi.advanceTimersByTimeAsync(100);

    expect(saveValue.mock.calls.map(([value]) => value)).toEqual([
      ['first'],
      ['latest'],
    ]);
    expect(saveValue.mock.calls[1][1]()).toBe(false);

    await vi.runAllTimersAsync();

    expect(saveValue).toHaveBeenCalledTimes(2);
  });

  it('starts saving again after the queue has drained, including an empty selection', async () => {
    const saveValue = vi.fn(async (_value: string[]) => {});
    const { enqueueSave } = createSaveQueue({ saveValue });

    enqueueSave(['first']);
    await vi.runAllTimersAsync();

    enqueueSave([]);
    await vi.runAllTimersAsync();

    expect(saveValue.mock.calls.map(([value]) => value)).toEqual([
      ['first'],
      [],
    ]);
  });

  it('drains values enqueued from within a save without overlapping saves', async () => {
    const savedValues: string[][] = [];
    const saveValue = vi.fn(
      async (value: string[], isSupersededValue: () => boolean) => {
        if (value.includes('first')) {
          enqueueSave(['next']);
          expect(saveValue).toHaveBeenCalledTimes(1);
          expect(isSupersededValue()).toBe(true);
        }

        await new Promise<void>((resolve) => setTimeout(resolve, 100));
        savedValues.push(value);
      },
    );
    const { enqueueSave } = createSaveQueue({ saveValue });

    enqueueSave(['first']);
    await vi.advanceTimersByTimeAsync(100);

    expect(savedValues).toEqual([['first']]);
    expect(saveValue).toHaveBeenCalledTimes(2);

    await vi.runAllTimersAsync();

    expect(savedValues).toEqual([['first'], ['next']]);
  });
});
