import { stubWindowMatchMedia } from '@/testing/stubWindowMatchMedia';
import { createInputMediaFeatureChangeObserver } from '../createInputMediaFeatureChangeObserver';

const dispatchChangeOnEveryMediaQueryList = (
  mediaQueryLists: EventTarget[],
) => {
  for (const mediaQueryList of mediaQueryLists) {
    mediaQueryList.dispatchEvent(new Event('change'));
  }
};

describe('createInputMediaFeatureChangeObserver', () => {
  afterEach(() => {
    delete (window as { matchMedia?: unknown }).matchMedia;
  });

  it('should notify when a hover or pointer query changes', () => {
    const { matchMedia, createdMediaQueryLists } = stubWindowMatchMedia();
    const onInputMediaFeatureChange = jest.fn();

    createInputMediaFeatureChangeObserver(onInputMediaFeatureChange).observe();
    dispatchChangeOnEveryMediaQueryList(createdMediaQueryLists);

    expect(matchMedia.mock.calls.map(([media]) => media)).toEqual([
      '(hover: hover)',
      '(pointer: fine)',
      '(pointer: coarse)',
    ]);
    expect(onInputMediaFeatureChange).toHaveBeenCalledTimes(3);
  });

  it('should stop notifying once disconnected', () => {
    const { createdMediaQueryLists } = stubWindowMatchMedia();
    const onInputMediaFeatureChange = jest.fn();
    const inputMediaFeatureChangeObserver =
      createInputMediaFeatureChangeObserver(onInputMediaFeatureChange);

    inputMediaFeatureChangeObserver.observe();
    inputMediaFeatureChangeObserver.disconnect();
    dispatchChangeOnEveryMediaQueryList(createdMediaQueryLists);

    expect(onInputMediaFeatureChange).not.toHaveBeenCalled();
  });

  it('should do nothing where matchMedia is unavailable', () => {
    expect(() =>
      createInputMediaFeatureChangeObserver(jest.fn()).observe(),
    ).not.toThrow();
  });
});
