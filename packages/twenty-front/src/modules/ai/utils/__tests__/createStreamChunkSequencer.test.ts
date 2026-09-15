import { type UIMessageChunk } from 'ai';

import { createStreamChunkSequencer } from '@/ai/utils/createStreamChunkSequencer';

const chunk = (text: string) =>
  ({ type: 'text-delta', id: 'text-1', delta: text }) as UIMessageChunk;

describe('createStreamChunkSequencer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const build = () => {
    const applied: string[] = [];
    const onGapStalled = jest.fn();
    const sequencer = createStreamChunkSequencer({
      onApply: (appliedChunk) =>
        applied.push((appliedChunk as { delta: string }).delta),
      onGapStalled,
    });

    return { sequencer, applied, onGapStalled };
  };

  it('applies in-order chunks immediately', () => {
    const { sequencer, applied } = build();

    sequencer.push(chunk('a'), 1);
    sequencer.push(chunk('b'), 2);

    expect(applied).toEqual(['a', 'b']);
  });

  it('buffers early arrivals until the gap is filled, then drains in order', () => {
    const { sequencer, applied } = build();

    sequencer.push(chunk('c'), 3);
    sequencer.push(chunk('d'), 4);
    expect(applied).toEqual([]);

    sequencer.push(chunk('a'), 1);
    sequencer.push(chunk('b'), 2);

    expect(applied).toEqual(['a', 'b', 'c', 'd']);
  });

  it('drops duplicates from overlapping catchup replay', () => {
    const { sequencer, applied } = build();

    sequencer.push(chunk('a'), 1);
    sequencer.push(chunk('b'), 2);
    sequencer.push(chunk('a'), 1);
    sequencer.push(chunk('b'), 2);
    sequencer.push(chunk('c'), 3);

    expect(applied).toEqual(['a', 'b', 'c']);
  });

  it('signals a stalled gap once so the caller can refetch', () => {
    const { sequencer, applied, onGapStalled } = build();

    sequencer.push(chunk('e'), 5);
    expect(onGapStalled).not.toHaveBeenCalled();

    jest.advanceTimersByTime(2_100);
    expect(onGapStalled).toHaveBeenCalledTimes(1);
    expect(applied).toEqual([]);

    [1, 2, 3, 4].forEach((seq) => sequencer.push(chunk(`s${seq}`), seq));
    expect(applied).toEqual(['s1', 's2', 's3', 's4', 'e']);
  });

  it('does not signal a gap that got filled before the stall timeout', () => {
    const { sequencer, onGapStalled } = build();

    sequencer.push(chunk('b'), 2);
    sequencer.push(chunk('a'), 1);

    jest.advanceTimersByTime(3_000);
    expect(onGapStalled).not.toHaveBeenCalled();
  });

  it('starts a fresh epoch after reset so the next turn applies from seq 1', () => {
    const { sequencer, applied } = build();

    sequencer.push(chunk('a'), 1);
    sequencer.push(chunk('b'), 2);
    sequencer.reset();

    sequencer.push(chunk('x'), 1);
    expect(applied).toEqual(['a', 'b', 'x']);
  });

  it('degrades to an in-order flush when the gap survives a second stall', () => {
    const { sequencer, applied, onGapStalled } = build();

    sequencer.push(chunk('d'), 4);
    sequencer.push(chunk('c'), 3);

    jest.advanceTimersByTime(2_100);
    expect(onGapStalled).toHaveBeenCalledTimes(1);
    expect(applied).toEqual([]);

    jest.advanceTimersByTime(2_100);
    expect(applied).toEqual(['c', 'd']);

    sequencer.push(chunk('e'), 5);
    expect(applied).toEqual(['c', 'd', 'e']);
  });

  it('applies seq-less chunks immediately without affecting ordering', () => {
    const { sequencer, applied } = build();

    sequencer.push(chunk('legacy'), undefined);
    sequencer.push(chunk('a'), 1);

    expect(applied).toEqual(['legacy', 'a']);
  });
});
