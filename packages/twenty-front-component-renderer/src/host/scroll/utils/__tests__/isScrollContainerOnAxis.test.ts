import { isScrollContainerOnAxis } from '@/host/scroll/utils/isScrollContainerOnAxis';

describe('isScrollContainerOnAxis', () => {
  it.each(['auto', 'scroll', 'hidden', 'overlay'])(
    'should be a scroll container when overflow is %s and the content overflows',
    (overflow) => {
      expect(
        isScrollContainerOnAxis({ overflow, scrollSize: 300, clientSize: 100 }),
      ).toBe(true);
    },
  );

  it.each(['visible', 'clip'])(
    'should not be a scroll container when overflow is %s even if the content overflows',
    (overflow) => {
      expect(
        isScrollContainerOnAxis({ overflow, scrollSize: 300, clientSize: 100 }),
      ).toBe(false);
    },
  );

  it('should not be a scroll container when the content fits exactly', () => {
    expect(
      isScrollContainerOnAxis({
        overflow: 'auto',
        scrollSize: 100,
        clientSize: 100,
      }),
    ).toBe(false);
  });

  it('should not be a scroll container when the content is smaller than the client size', () => {
    expect(
      isScrollContainerOnAxis({
        overflow: 'scroll',
        scrollSize: 50,
        clientSize: 100,
      }),
    ).toBe(false);
  });
});
