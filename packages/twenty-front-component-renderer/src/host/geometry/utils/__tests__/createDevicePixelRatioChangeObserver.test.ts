import { createDevicePixelRatioChangeObserver } from '../createDevicePixelRatioChangeObserver';

const setupMatchMedia = () => {
  const createdMediaQueryLists: EventTarget[] = [];

  const matchMedia = jest.fn((media: string) => {
    const mediaQueryList = Object.assign(new EventTarget(), { media });

    createdMediaQueryLists.push(mediaQueryList);

    return mediaQueryList;
  });

  Object.defineProperty(window, 'matchMedia', {
    value: matchMedia,
    configurable: true,
    writable: true,
  });

  return { matchMedia, createdMediaQueryLists };
};

const setDevicePixelRatio = (devicePixelRatio: number) => {
  Object.defineProperty(window, 'devicePixelRatio', {
    value: devicePixelRatio,
    configurable: true,
  });
};

const flipResolution = (mediaQueryList: EventTarget) => {
  mediaQueryList.dispatchEvent(new Event('change'));
};

describe('createDevicePixelRatioChangeObserver', () => {
  afterEach(() => {
    delete (window as { matchMedia?: unknown }).matchMedia;
    delete (window as { devicePixelRatio?: unknown }).devicePixelRatio;
  });

  it('should watch a resolution query for the current device pixel ratio', () => {
    const { matchMedia } = setupMatchMedia();
    setDevicePixelRatio(2);

    createDevicePixelRatioChangeObserver(jest.fn()).observe();

    expect(matchMedia).toHaveBeenCalledWith('(resolution: 2dppx)');
  });

  it('should notify once per change and re-arm for the new ratio', () => {
    const { matchMedia, createdMediaQueryLists } = setupMatchMedia();
    const onDevicePixelRatioChange = jest.fn();
    setDevicePixelRatio(2);

    createDevicePixelRatioChangeObserver(onDevicePixelRatioChange).observe();

    const [firstResolutionQueryList] = createdMediaQueryLists;

    setDevicePixelRatio(1);
    flipResolution(firstResolutionQueryList);

    expect(onDevicePixelRatioChange).toHaveBeenCalledTimes(1);
    expect(matchMedia).toHaveBeenLastCalledWith('(resolution: 1dppx)');

    flipResolution(firstResolutionQueryList);

    expect(onDevicePixelRatioChange).toHaveBeenCalledTimes(1);

    flipResolution(createdMediaQueryLists[1]);

    expect(onDevicePixelRatioChange).toHaveBeenCalledTimes(2);
  });

  it('should stop notifying once disconnected', () => {
    const { createdMediaQueryLists } = setupMatchMedia();
    const onDevicePixelRatioChange = jest.fn();
    const devicePixelRatioChangeObserver = createDevicePixelRatioChangeObserver(
      onDevicePixelRatioChange,
    );

    devicePixelRatioChangeObserver.observe();
    devicePixelRatioChangeObserver.disconnect();
    flipResolution(createdMediaQueryLists[0]);

    expect(onDevicePixelRatioChange).not.toHaveBeenCalled();
  });

  it('should do nothing where matchMedia is unavailable', () => {
    expect(() =>
      createDevicePixelRatioChangeObserver(jest.fn()).observe(),
    ).not.toThrow();
  });
});
