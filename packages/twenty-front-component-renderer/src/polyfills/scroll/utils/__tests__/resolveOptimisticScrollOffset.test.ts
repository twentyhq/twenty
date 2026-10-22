import { resolveOptimisticScrollOffset } from '@/polyfills/scroll/utils/resolveOptimisticScrollOffset';
import { type ScrollCommand } from '@/types/ScrollCommand';
import { type ScrollRequest } from '@/types/ScrollRequest';

const createScrollCommands = (requests: ScrollRequest[]): ScrollCommand[] =>
  requests.map((request, requestIndex) => ({
    sequence: requestIndex + 1,
    request,
  }));

describe('resolveOptimisticScrollOffset', () => {
  it('should return the host offset when no command is pending', () => {
    expect(
      resolveOptimisticScrollOffset({
        hostOffset: 140,
        pendingCommands: [],
        axis: 'top',
      }),
    ).toBe(140);
  });

  it('should return the offset of the latest pending scroll on the axis', () => {
    expect(
      resolveOptimisticScrollOffset({
        hostOffset: 0,
        pendingCommands: createScrollCommands([
          { method: 'scrollTo', top: 50 },
          { method: 'scrollTo', top: 80, left: 10 },
        ]),
        axis: 'top',
      }),
    ).toBe(80);
  });

  it('should ignore pending scrolls that only target the other axis', () => {
    expect(
      resolveOptimisticScrollOffset({
        hostOffset: 20,
        pendingCommands: createScrollCommands([
          { method: 'scrollTo', top: 300 },
        ]),
        axis: 'left',
      }),
    ).toBe(20);
  });

  it('should keep the latest axis offset when a later scroll only targets the other axis', () => {
    expect(
      resolveOptimisticScrollOffset({
        hostOffset: 0,
        pendingCommands: createScrollCommands([
          { method: 'scrollTo', top: 90 },
          { method: 'scrollTo', left: 40 },
        ]),
        axis: 'top',
      }),
    ).toBe(90);
  });

  it('should ignore pending scroll into view commands', () => {
    expect(
      resolveOptimisticScrollOffset({
        hostOffset: 60,
        pendingCommands: createScrollCommands([
          { method: 'scrollIntoView', block: 'start', inline: 'nearest' },
        ]),
        axis: 'top',
      }),
    ).toBe(60);
    expect(
      resolveOptimisticScrollOffset({
        hostOffset: 0,
        pendingCommands: createScrollCommands([
          { method: 'scrollTo', top: 75 },
          { method: 'scrollIntoView', block: 'end', inline: 'center' },
        ]),
        axis: 'top',
      }),
    ).toBe(75);
  });

  it('should keep a negative right-to-left host offset without clamping', () => {
    expect(
      resolveOptimisticScrollOffset({
        hostOffset: -45,
        pendingCommands: [],
        axis: 'left',
      }),
    ).toBe(-45);
  });

  it('should keep a negative right-to-left pending offset without clamping', () => {
    expect(
      resolveOptimisticScrollOffset({
        hostOffset: 0,
        pendingCommands: createScrollCommands([
          { method: 'scrollTo', left: -120 },
        ]),
        axis: 'left',
      }),
    ).toBe(-120);
  });
});
