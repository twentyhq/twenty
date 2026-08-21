import { watchCallRecordingTranscriptFollowScroll } from '@/page-layout/widgets/call-recording-transcript/utils/watchCallRecordingTranscriptFollowScroll';

class FakeVideoElement extends EventTarget {}

const makeElementWithRect = (top: number, bottom: number) => ({
  getBoundingClientRect: () => ({ top, bottom }),
});

const makeScrollContainerElement = ({
  currentSpokenWordElement,
}: {
  currentSpokenWordElement: ReturnType<typeof makeElementWithRect> | null;
}) => {
  const scrollToCalls: ScrollToOptions[] = [];

  const scrollContainerElement = {
    clientHeight: 100,
    scrollTop: 0,
    getBoundingClientRect: () => ({ top: 0, bottom: 100 }),
    querySelector: () => currentSpokenWordElement,
    scrollTo: (options: ScrollToOptions) => {
      scrollToCalls.push(options);
    },
  };

  return { scrollContainerElement, scrollToCalls };
};

describe('watchCallRecordingTranscriptFollowScroll', () => {
  const originalMatchMedia = window.matchMedia;
  let fakeVideoElement: FakeVideoElement;

  beforeEach(() => {
    jest.useFakeTimers();
    fakeVideoElement = new FakeVideoElement();
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: () => ({ matches: false }),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: originalMatchMedia,
    });
  });

  const startWatching = ({
    scrollContainerElement,
    activeEntryElement = null,
  }: {
    scrollContainerElement: ReturnType<
      typeof makeScrollContainerElement
    >['scrollContainerElement'];
    activeEntryElement?: ReturnType<typeof makeElementWithRect> | null;
  }) =>
    watchCallRecordingTranscriptFollowScroll({
      videoElement: fakeVideoElement,
      scrollContainerElement,
      getActiveEntryElement: () => activeEntryElement,
    });

  it('should scroll the current word into the reading band when it drifts below', () => {
    const { scrollContainerElement, scrollToCalls } =
      makeScrollContainerElement({
        currentSpokenWordElement: makeElementWithRect(90, 95),
      });

    const stopWatching = startWatching({ scrollContainerElement });

    fakeVideoElement.dispatchEvent(new Event('timeupdate'));
    jest.advanceTimersByTime(20);

    expect(scrollToCalls).toEqual([{ behavior: 'smooth', top: 55 }]);

    stopWatching();
  });

  it('should not scroll while the current word stays inside the reading band', () => {
    const { scrollContainerElement, scrollToCalls } =
      makeScrollContainerElement({
        currentSpokenWordElement: makeElementWithRect(40, 45),
      });

    const stopWatching = startWatching({ scrollContainerElement });

    fakeVideoElement.dispatchEvent(new Event('timeupdate'));
    jest.advanceTimersByTime(20);

    expect(scrollToCalls).toEqual([]);

    stopWatching();
  });

  it('should fall back to the active entry element when no word is marked', () => {
    const { scrollContainerElement, scrollToCalls } =
      makeScrollContainerElement({ currentSpokenWordElement: null });

    const stopWatching = startWatching({
      scrollContainerElement,
      activeEntryElement: makeElementWithRect(120, 160),
    });

    fakeVideoElement.dispatchEvent(new Event('timeupdate'));
    jest.advanceTimersByTime(20);

    expect(scrollToCalls).toEqual([{ behavior: 'smooth', top: 85 }]);

    stopWatching();
  });

  it('should stop following after the returned cleanup runs', () => {
    const { scrollContainerElement, scrollToCalls } =
      makeScrollContainerElement({
        currentSpokenWordElement: makeElementWithRect(90, 95),
      });

    const stopWatching = startWatching({ scrollContainerElement });

    stopWatching();

    fakeVideoElement.dispatchEvent(new Event('timeupdate'));
    jest.advanceTimersByTime(20);

    expect(scrollToCalls).toEqual([]);
  });
});
