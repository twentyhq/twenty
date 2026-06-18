import {
  armClipboardWriteFromUserGesture,
  fulfillClipboardWriteFromUserGesture,
} from '../frontComponentClipboardGate';

type FakeClipboardItemData = Record<string, Promise<Blob> | Blob | string>;

class FakeClipboardItem {
  items: FakeClipboardItemData;

  constructor(items: FakeClipboardItemData) {
    this.items = items;
  }
}

describe('frontComponentClipboardGate', () => {
  let write: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();

    write = jest.fn((items: FakeClipboardItem[]) =>
      Promise.all(items.flatMap((item) => Object.values(item.items))).then(
        () => undefined,
      ),
    );

    (globalThis as unknown as { ClipboardItem: unknown }).ClipboardItem =
      FakeClipboardItem;

    Object.defineProperty(globalThis.navigator, 'clipboard', {
      value: { write },
      configurable: true,
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should return null when fulfilling without an armed gesture', () => {
    expect(fulfillClipboardWriteFromUserGesture('text')).toBeNull();
    expect(write).not.toHaveBeenCalled();
  });

  it('should arm a clipboard write and resolve it when fulfilled', async () => {
    armClipboardWriteFromUserGesture();

    expect(write).toHaveBeenCalledTimes(1);

    const writePromise = fulfillClipboardWriteFromUserGesture('copied text');

    expect(writePromise).not.toBeNull();
    await expect(writePromise).resolves.toBeUndefined();
  });

  it('should do nothing when the async clipboard API is unsupported', () => {
    (globalThis as unknown as { ClipboardItem?: unknown }).ClipboardItem =
      undefined;

    armClipboardWriteFromUserGesture();

    expect(write).not.toHaveBeenCalled();
    expect(fulfillClipboardWriteFromUserGesture('text')).toBeNull();
  });

  it('should arm a fresh write when re-armed within the same window', async () => {
    armClipboardWriteFromUserGesture();
    armClipboardWriteFromUserGesture();

    expect(write).toHaveBeenCalledTimes(2);

    const writePromise = fulfillClipboardWriteFromUserGesture('text');

    await expect(writePromise).resolves.toBeUndefined();
  });
});
