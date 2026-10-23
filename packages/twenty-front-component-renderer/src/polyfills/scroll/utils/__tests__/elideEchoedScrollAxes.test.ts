import { elideEchoedScrollAxes } from '@/polyfills/scroll/utils/elideEchoedScrollAxes';
import { type ScrollAxis } from '@/types/ScrollAxis';
import { type ScrollAxisOffsets } from '@/types/ScrollAxisOffsets';

const readOffsetsFrom =
  (currentOffsets: ScrollAxisOffsets) => (axis: ScrollAxis) =>
    currentOffsets[axis];

describe('elideEchoedScrollAxes', () => {
  it('should drop an axis restoring the offset that was just read and is still current', () => {
    expect(
      elideEchoedScrollAxes({
        requestedOffsets: { top: 120 },
        lastReadOffsets: { top: 120 },
        readCurrentOffset: readOffsetsFrom({ top: 120, left: 0 }),
      }),
    ).toEqual({});
  });

  it('should keep a cold reset write when no offset was read before', () => {
    expect(
      elideEchoedScrollAxes({
        requestedOffsets: { top: 0 },
        lastReadOffsets: undefined,
        readCurrentOffset: readOffsetsFrom({ top: 0, left: 0 }),
      }),
    ).toEqual({ top: 0 });
  });

  it('should keep an axis when no offset was read on that axis', () => {
    expect(
      elideEchoedScrollAxes({
        requestedOffsets: { left: 0 },
        lastReadOffsets: { top: 0 },
        readCurrentOffset: readOffsetsFrom({ top: 0, left: 0 }),
      }),
    ).toEqual({ left: 0 });
  });

  it('should keep an axis equal to the last read offset when the current offset moved', () => {
    expect(
      elideEchoedScrollAxes({
        requestedOffsets: { top: 120 },
        lastReadOffsets: { top: 120 },
        readCurrentOffset: readOffsetsFrom({ top: 80, left: 0 }),
      }),
    ).toEqual({ top: 120 });
  });

  it('should keep an axis equal to the current offset when it differs from the last read offset', () => {
    expect(
      elideEchoedScrollAxes({
        requestedOffsets: { top: 120 },
        lastReadOffsets: { top: 50 },
        readCurrentOffset: readOffsetsFrom({ top: 120, left: 0 }),
      }),
    ).toEqual({ top: 120 });
  });

  it('should keep an axis whose current offset is unknown', () => {
    expect(
      elideEchoedScrollAxes({
        requestedOffsets: { top: 120 },
        lastReadOffsets: { top: 120 },
        readCurrentOffset: readOffsetsFrom({ left: 0 }),
      }),
    ).toEqual({ top: 120 });
  });

  it('should only read the current offset of axes matching their last read offset', () => {
    const readCurrentOffset = jest.fn(readOffsetsFrom({ top: 120, left: 30 }));

    elideEchoedScrollAxes({
      requestedOffsets: { top: 120, left: 30 },
      lastReadOffsets: { top: 120, left: 10 },
      readCurrentOffset,
    });

    expect(readCurrentOffset.mock.calls).toEqual([['top']]);
  });

  it('should decide each axis independently', () => {
    expect(
      elideEchoedScrollAxes({
        requestedOffsets: { top: 120, left: 30 },
        lastReadOffsets: { top: 120, left: 10 },
        readCurrentOffset: readOffsetsFrom({ top: 120, left: 30 }),
      }),
    ).toEqual({ left: 30 });
    expect(
      elideEchoedScrollAxes({
        requestedOffsets: { top: 200, left: 30 },
        lastReadOffsets: { top: 120, left: 30 },
        readCurrentOffset: readOffsetsFrom({ top: 120, left: 30 }),
      }),
    ).toEqual({ top: 200 });
  });

  it('should not add axes that were not requested', () => {
    expect(
      elideEchoedScrollAxes({
        requestedOffsets: {},
        lastReadOffsets: { top: 120, left: 30 },
        readCurrentOffset: readOffsetsFrom({ top: 0, left: 0 }),
      }),
    ).toEqual({});
  });
});
