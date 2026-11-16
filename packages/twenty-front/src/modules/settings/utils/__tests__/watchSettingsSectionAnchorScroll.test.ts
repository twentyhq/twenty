import { watchSettingsSectionAnchorScroll } from '@/settings/utils/watchSettingsSectionAnchorScroll';

const scrollIntoViewMock = jest.fn();
const originalScrollIntoView = Element.prototype.scrollIntoView;
const originalMatchMedia = window.matchMedia;
const originalResizeObserver = globalThis.ResizeObserver;

let resizeCallbacks: ResizeObserverCallback[] = [];
let observedElements: Element[] = [];
const disconnectMock = jest.fn();

class ResizeObserverStub {
  constructor(callback: ResizeObserverCallback) {
    resizeCallbacks.push(callback);
  }

  observe(element: Element) {
    observedElements.push(element);
  }

  unobserve() {}

  disconnect() {
    disconnectMock();
  }
}

const mockMatchMedia = (matches: boolean) =>
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: () => ({ matches }),
  });

const triggerPageResize = () =>
  resizeCallbacks.forEach((callback) =>
    callback([], {} as unknown as ResizeObserver),
  );

const mountAnchor = () => {
  const pageElement = document.createElement('div');
  const anchorElement = document.createElement('div');

  pageElement.appendChild(anchorElement);
  document.body.appendChild(pageElement);

  return { pageElement, anchorElement };
};

describe('watchSettingsSectionAnchorScroll', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = scrollIntoViewMock;
    globalThis.ResizeObserver =
      ResizeObserverStub as unknown as typeof ResizeObserver;
    mockMatchMedia(false);
  });

  afterEach(() => {
    jest.clearAllMocks();
    resizeCallbacks = [];
    observedElements = [];
    document.body.innerHTML = '';
    Element.prototype.scrollIntoView = originalScrollIntoView;
    globalThis.ResizeObserver = originalResizeObserver;
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: originalMatchMedia,
    });
  });

  it('should scroll the anchor into view', () => {
    const { anchorElement } = mountAnchor();

    const stopWatching = watchSettingsSectionAnchorScroll(anchorElement);

    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });

    stopWatching();
  });

  it('should scroll without animation under reduced motion', () => {
    mockMatchMedia(true);
    const { anchorElement } = mountAnchor();

    const stopWatching = watchSettingsSectionAnchorScroll(anchorElement);

    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: 'auto',
      block: 'start',
    });

    stopWatching();
  });

  it('should scroll again when the page around the anchor resizes', () => {
    const { pageElement, anchorElement } = mountAnchor();

    const stopWatching = watchSettingsSectionAnchorScroll(anchorElement);

    expect(observedElements).toEqual([pageElement]);

    triggerPageResize();

    expect(scrollIntoViewMock).toHaveBeenCalledTimes(2);

    stopWatching();
  });

  it('should stop following page resizes once the user scrolls', () => {
    const { anchorElement } = mountAnchor();

    watchSettingsSectionAnchorScroll(anchorElement);

    window.dispatchEvent(new Event('wheel'));

    expect(disconnectMock).toHaveBeenCalledTimes(1);

    triggerPageResize();
    window.dispatchEvent(new Event('wheel'));

    expect(disconnectMock).toHaveBeenCalledTimes(1);
  });

  it('should stop following page resizes when stopped', () => {
    const { anchorElement } = mountAnchor();

    const stopWatching = watchSettingsSectionAnchorScroll(anchorElement);

    stopWatching();

    expect(disconnectMock).toHaveBeenCalledTimes(1);
  });
});
