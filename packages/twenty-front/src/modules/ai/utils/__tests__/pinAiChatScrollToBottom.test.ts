import { AI_CHAT_SCROLL_PIN_MAX_DURATION_IN_MS } from '@/ai/constants/AiChatScrollPinMaxDurationInMs';
import { AI_CHAT_SCROLL_PIN_MIN_DURATION_IN_MS } from '@/ai/constants/AiChatScrollPinMinDurationInMs';
import { AI_CHAT_SCROLL_PIN_QUIET_DURATION_IN_MS } from '@/ai/constants/AiChatScrollPinQuietDurationInMs';
import { pinAiChatScrollToBottom } from '@/ai/utils/pinAiChatScrollToBottom';

const FRAME_DURATION_IN_MS = 16;

type FakeScrollWrapperElement = HTMLElement & {
  scrollHeight: number;
  clientHeight: number;
  clientWidth: number;
  scrollTop: number;
};

let currentTimeInMs = 0;
let nextFrameId = 0;
let pendingFrameCallbacksById: Map<number, FrameRequestCallback>;
let listenersByEventName: Map<string, EventListener>;

const buildScrollWrapperElement = () => {
  listenersByEventName = new Map();

  return {
    scrollHeight: 1000,
    clientHeight: 400,
    clientWidth: 300,
    scrollTop: 0,
    addEventListener: (eventName: string, listener: EventListener) => {
      listenersByEventName.set(eventName, listener);
    },
    removeEventListener: (eventName: string) => {
      listenersByEventName.delete(eventName);
    },
  } as unknown as FakeScrollWrapperElement;
};

const advanceOneFrame = () => {
  currentTimeInMs += FRAME_DURATION_IN_MS;

  const frameCallbacks = [...pendingFrameCallbacksById.values()];
  pendingFrameCallbacksById.clear();
  frameCallbacks.forEach((frameCallback) => frameCallback(currentTimeInMs));
};

const advanceFrames = (frameCount: number) => {
  for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
    advanceOneFrame();
  }
};

const framesToCover = (durationInMs: number) =>
  Math.ceil(durationInMs / FRAME_DURATION_IN_MS) + 2;

describe('pinAiChatScrollToBottom', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    currentTimeInMs = 0;
    nextFrameId = 0;
    pendingFrameCallbacksById = new Map();

    jest.spyOn(performance, 'now').mockImplementation(() => currentTimeInMs);

    jest
      .spyOn(globalThis, 'requestAnimationFrame')
      .mockImplementation((frameCallback: FrameRequestCallback) => {
        nextFrameId++;
        pendingFrameCallbacksById.set(nextFrameId, frameCallback);
        return nextFrameId;
      });

    jest
      .spyOn(globalThis, 'cancelAnimationFrame')
      .mockImplementation((frameId: number) => {
        pendingFrameCallbacksById.delete(frameId);
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('should pin to the bottom synchronously before any frame runs', () => {
    const scrollWrapperElement = buildScrollWrapperElement();

    pinAiChatScrollToBottom({ scrollWrapperElement });

    expect(scrollWrapperElement.scrollTop).toBe(1000);
  });

  it('should keep re-pinning while the content keeps growing', () => {
    const scrollWrapperElement = buildScrollWrapperElement();

    pinAiChatScrollToBottom({ scrollWrapperElement });

    scrollWrapperElement.scrollHeight = 5000;
    advanceOneFrame();

    expect(scrollWrapperElement.scrollTop).toBe(5000);

    scrollWrapperElement.scrollHeight = 9000;
    advanceOneFrame();

    expect(scrollWrapperElement.scrollTop).toBe(9000);
  });

  it('should keep re-pinning while only the width changes', () => {
    const scrollWrapperElement = buildScrollWrapperElement();
    const onPinningStopped = jest.fn();

    pinAiChatScrollToBottom({ scrollWrapperElement, onPinningStopped });

    for (let frameIndex = 0; frameIndex < 15; frameIndex++) {
      scrollWrapperElement.clientWidth -= 10;
      advanceOneFrame();
    }

    expect(onPinningStopped).not.toHaveBeenCalled();
  });

  it('should not stop before the minimum duration even when nothing changes', () => {
    const scrollWrapperElement = buildScrollWrapperElement();
    const onPinningStopped = jest.fn();

    pinAiChatScrollToBottom({ scrollWrapperElement, onPinningStopped });

    advanceFrames(
      Math.floor(
        AI_CHAT_SCROLL_PIN_QUIET_DURATION_IN_MS / FRAME_DURATION_IN_MS,
      ) + 1,
    );

    expect(currentTimeInMs).toBeLessThan(AI_CHAT_SCROLL_PIN_MIN_DURATION_IN_MS);
    expect(onPinningStopped).not.toHaveBeenCalled();
  });

  it('should stop once the content is quiet and the minimum duration has elapsed', () => {
    const scrollWrapperElement = buildScrollWrapperElement();
    const onContentSettled = jest.fn();
    const onPinningStopped = jest.fn();

    pinAiChatScrollToBottom({
      scrollWrapperElement,
      onContentSettled,
      onPinningStopped,
    });

    advanceFrames(framesToCover(AI_CHAT_SCROLL_PIN_MIN_DURATION_IN_MS));

    expect(onContentSettled).toHaveBeenCalledTimes(1);
    expect(onPinningStopped).toHaveBeenCalledTimes(1);
  });

  it('should extend the window when the content grows late', () => {
    const scrollWrapperElement = buildScrollWrapperElement();
    const onPinningStopped = jest.fn();

    pinAiChatScrollToBottom({ scrollWrapperElement, onPinningStopped });

    advanceFrames(5);
    scrollWrapperElement.scrollHeight = 4000;
    advanceOneFrame();

    advanceFrames(
      Math.floor(
        AI_CHAT_SCROLL_PIN_QUIET_DURATION_IN_MS / FRAME_DURATION_IN_MS,
      ) - 2,
    );

    expect(onPinningStopped).not.toHaveBeenCalled();
    expect(scrollWrapperElement.scrollTop).toBe(4000);
  });

  it('should stop immediately when the user scrolls', () => {
    const scrollWrapperElement = buildScrollWrapperElement();
    const onContentSettled = jest.fn();
    const onPinningStopped = jest.fn();

    pinAiChatScrollToBottom({
      scrollWrapperElement,
      onContentSettled,
      onPinningStopped,
    });

    listenersByEventName.get('wheel')?.(new Event('wheel'));

    expect(onContentSettled).toHaveBeenCalledTimes(1);
    expect(onPinningStopped).toHaveBeenCalledTimes(1);

    scrollWrapperElement.scrollHeight = 9000;
    advanceOneFrame();

    expect(scrollWrapperElement.scrollTop).toBe(1000);
  });

  it('should stop via the watchdog when frames never run', () => {
    const scrollWrapperElement = buildScrollWrapperElement();
    const onContentSettled = jest.fn();
    const onPinningStopped = jest.fn();

    pinAiChatScrollToBottom({
      scrollWrapperElement,
      onContentSettled,
      onPinningStopped,
    });

    jest.advanceTimersByTime(AI_CHAT_SCROLL_PIN_MAX_DURATION_IN_MS);

    expect(onContentSettled).toHaveBeenCalledTimes(1);
    expect(onPinningStopped).toHaveBeenCalledTimes(1);
  });

  it('should invoke each callback exactly once when stopped by the caller', () => {
    const scrollWrapperElement = buildScrollWrapperElement();
    const onContentSettled = jest.fn();
    const onPinningStopped = jest.fn();

    const stop = pinAiChatScrollToBottom({
      scrollWrapperElement,
      onContentSettled,
      onPinningStopped,
    });

    stop();
    stop();
    jest.advanceTimersByTime(AI_CHAT_SCROLL_PIN_MAX_DURATION_IN_MS);

    expect(onContentSettled).toHaveBeenCalledTimes(1);
    expect(onPinningStopped).toHaveBeenCalledTimes(1);
    expect(listenersByEventName.size).toBe(0);
  });
});
