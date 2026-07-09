import { isFirstOverflowingChildElement } from '@/ui/layout/expandable-list/utils/isFirstOverflowingChildElement';

type FakeChildGeometry = {
  offsetLeft: number;
  offsetWidth: number;
  previousOffsetLeft: number | null;
};

const buildContainer = ({
  clientWidth,
  scrollWidth,
}: {
  clientWidth: number;
  scrollWidth: number;
}) => ({ clientWidth, scrollWidth }) as HTMLElement;

const buildChild = ({
  offsetLeft,
  offsetWidth,
  previousOffsetLeft,
}: FakeChildGeometry) =>
  ({
    offsetLeft,
    offsetWidth,
    previousElementSibling:
      previousOffsetLeft === null ? null : { offsetLeft: previousOffsetLeft },
  }) as unknown as HTMLElement;

describe('isFirstOverflowingChildElement', () => {
  it('returns true when the previous chip fits but this chip is only right-edge clipped', () => {
    // Regression for the "+N never renders" bug: the chip starts inside the
    // container (offsetLeft < clientWidth) but its right edge spills over.
    const result = isFirstOverflowingChildElement({
      containerElement: buildContainer({ clientWidth: 145, scrollWidth: 200 }),
      childElement: buildChild({
        offsetLeft: 128,
        offsetWidth: 72,
        previousOffsetLeft: 67,
      }),
    });

    expect(result).toBe(true);
  });

  it('returns true when the chip left edge is fully past the container', () => {
    const result = isFirstOverflowingChildElement({
      containerElement: buildContainer({ clientWidth: 145, scrollWidth: 250 }),
      childElement: buildChild({
        offsetLeft: 160,
        offsetWidth: 50,
        previousOffsetLeft: 100,
      }),
    });

    expect(result).toBe(true);
  });

  it('returns false when the chip fits entirely within the container', () => {
    const result = isFirstOverflowingChildElement({
      containerElement: buildContainer({ clientWidth: 145, scrollWidth: 200 }),
      childElement: buildChild({
        offsetLeft: 67,
        offsetWidth: 50,
        previousOffsetLeft: 0,
      }),
    });

    expect(result).toBe(false);
  });

  it('returns false when the previous chip is itself already overflowing', () => {
    const result = isFirstOverflowingChildElement({
      containerElement: buildContainer({ clientWidth: 145, scrollWidth: 300 }),
      childElement: buildChild({
        offsetLeft: 200,
        offsetWidth: 50,
        previousOffsetLeft: 150,
      }),
    });

    expect(result).toBe(false);
  });

  it('returns false for the first child (no previous sibling)', () => {
    const result = isFirstOverflowingChildElement({
      containerElement: buildContainer({ clientWidth: 145, scrollWidth: 200 }),
      childElement: buildChild({
        offsetLeft: 0,
        offsetWidth: 200,
        previousOffsetLeft: null,
      }),
    });

    expect(result).toBe(false);
  });

  it('returns false when the container does not overflow', () => {
    const result = isFirstOverflowingChildElement({
      containerElement: buildContainer({ clientWidth: 145, scrollWidth: 145 }),
      childElement: buildChild({
        offsetLeft: 128,
        offsetWidth: 72,
        previousOffsetLeft: 67,
      }),
    });

    expect(result).toBe(false);
  });

  it('returns false when container or child is missing', () => {
    expect(
      isFirstOverflowingChildElement({
        containerElement: null,
        childElement: buildChild({
          offsetLeft: 128,
          offsetWidth: 72,
          previousOffsetLeft: 67,
        }),
      }),
    ).toBe(false);

    expect(
      isFirstOverflowingChildElement({
        containerElement: buildContainer({ clientWidth: 145, scrollWidth: 200 }),
        childElement: null,
      }),
    ).toBe(false);
  });
});
