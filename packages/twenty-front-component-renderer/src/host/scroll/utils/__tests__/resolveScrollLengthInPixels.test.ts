import { resolveScrollLengthInPixels } from '@/host/scroll/utils/resolveScrollLengthInPixels';

describe('resolveScrollLengthInPixels', () => {
  it('should read a pixel length', () => {
    expect(
      resolveScrollLengthInPixels({ length: '12px', referenceSize: 300 }),
    ).toBe(12);
  });

  it('should read a fractional pixel length', () => {
    expect(
      resolveScrollLengthInPixels({ length: '12.5px', referenceSize: 300 }),
    ).toBe(12.5);
  });

  it('should read a negative pixel length', () => {
    expect(
      resolveScrollLengthInPixels({ length: '-4px', referenceSize: 300 }),
    ).toBe(-4);
  });

  it('should resolve a percentage against the reference size', () => {
    expect(
      resolveScrollLengthInPixels({ length: '25%', referenceSize: 200 }),
    ).toBe(50);
  });

  it('should resolve a percentage surrounded by whitespace against the reference size', () => {
    expect(
      resolveScrollLengthInPixels({ length: ' 10% ', referenceSize: 200 }),
    ).toBe(20);
  });

  it('should resolve a percentage to zero when the reference size is zero', () => {
    expect(
      resolveScrollLengthInPixels({ length: '50%', referenceSize: 0 }),
    ).toBe(0);
  });

  it('should resolve a calc() length mixing a percentage and pixels', () => {
    expect(
      resolveScrollLengthInPixels({
        length: 'calc(10% + 20px)',
        referenceSize: 200,
      }),
    ).toBe(40);
  });

  it('should resolve auto to zero', () => {
    expect(
      resolveScrollLengthInPixels({ length: 'auto', referenceSize: 200 }),
    ).toBe(0);
  });

  it('should resolve an empty length to zero', () => {
    expect(
      resolveScrollLengthInPixels({ length: '', referenceSize: 200 }),
    ).toBe(0);
  });
});
