import { normalizeScrollIntoViewArguments } from '@/polyfills/scroll/utils/normalizeScrollIntoViewArguments';

describe('normalizeScrollIntoViewArguments', () => {
  it('should align to the start for undefined, null and true', () => {
    const startAlignments = { block: 'start', inline: 'nearest' };

    expect(normalizeScrollIntoViewArguments(undefined)).toEqual(
      startAlignments,
    );
    expect(normalizeScrollIntoViewArguments(null)).toEqual(startAlignments);
    expect(normalizeScrollIntoViewArguments(true)).toEqual(startAlignments);
  });

  it('should align to the end for false', () => {
    expect(normalizeScrollIntoViewArguments(false)).toEqual({
      block: 'end',
      inline: 'nearest',
    });
  });

  it('should align truthy primitives to the start', () => {
    const startAlignments = { block: 'start', inline: 'nearest' };

    expect(normalizeScrollIntoViewArguments(1)).toEqual(startAlignments);
    expect(normalizeScrollIntoViewArguments('center')).toEqual(startAlignments);
  });

  it('should align falsy primitives to the end', () => {
    const endAlignments = { block: 'end', inline: 'nearest' };

    expect(normalizeScrollIntoViewArguments(0)).toEqual(endAlignments);
    expect(normalizeScrollIntoViewArguments('')).toEqual(endAlignments);
    expect(normalizeScrollIntoViewArguments(Number.NaN)).toEqual(endAlignments);
  });

  it('should default an empty options object to block start and inline nearest', () => {
    expect(normalizeScrollIntoViewArguments({})).toEqual({
      block: 'start',
      inline: 'nearest',
    });
  });

  it('should default only the alignment the options leave undefined', () => {
    expect(normalizeScrollIntoViewArguments({ block: 'center' })).toEqual({
      block: 'center',
      inline: 'nearest',
    });
    expect(normalizeScrollIntoViewArguments({ inline: 'end' })).toEqual({
      block: 'start',
      inline: 'end',
    });
  });

  it('should keep every valid alignment passed explicitly', () => {
    for (const alignment of ['start', 'center', 'end', 'nearest']) {
      expect(
        normalizeScrollIntoViewArguments({
          block: alignment,
          inline: alignment,
          behavior: 'smooth',
        }),
      ).toEqual({ block: alignment, inline: alignment });
    }
  });

  it('should throw a type error for an invalid block alignment', () => {
    expect(() => normalizeScrollIntoViewArguments({ block: 'top' })).toThrow(
      TypeError,
    );
  });

  it('should throw a type error for an invalid inline alignment', () => {
    expect(() =>
      normalizeScrollIntoViewArguments({ inline: 'middle' }),
    ).toThrow(TypeError);
  });

  it('should throw a type error for a null alignment', () => {
    expect(() => normalizeScrollIntoViewArguments({ block: null })).toThrow(
      TypeError,
    );
  });
});
