import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, renderHook } from '@testing-library/react';

import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const mockEnqueueToast = jest.fn();

jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));

const mockWriteText = jest.fn();
const mockWrite = jest.fn();

class MockClipboardItem {
  constructor(readonly items: Record<string, Promise<Blob>>) {}
}

const readBlobAsText = (blob: Blob) =>
  new Promise<string>((resolve) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.readAsText(blob);
  });

type ClipboardItemConstructor = new (
  items: Record<string, Promise<Blob>>,
) => MockClipboardItem;

const setClipboardItem = (
  clipboardItem: ClipboardItemConstructor | undefined,
) => {
  Object.defineProperty(globalThis, 'ClipboardItem', {
    configurable: true,
    writable: true,
    value: clipboardItem,
  });
};

const setIsSecureContext = (isSecureContext: boolean) => {
  Object.defineProperty(window, 'isSecureContext', {
    configurable: true,
    value: isSecureContext,
  });
};

const renderUseCopyToClipboard = () =>
  renderHook(() => useCopyToClipboard(), {
    wrapper: ({ children }) => I18nProvider({ i18n, children }),
  });

describe('useCopyToClipboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWriteText.mockResolvedValue(undefined);
    mockWrite.mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: mockWriteText, write: mockWrite },
    });
    setClipboardItem(undefined);
    setIsSecureContext(true);
  });

  describe('copyToClipboard with a pending value', () => {
    it('should write a ClipboardItem before the value resolves', async () => {
      setClipboardItem(MockClipboardItem);

      const { result } = renderUseCopyToClipboard();

      let copyPromise: Promise<void> | undefined;

      act(() => {
        copyPromise = result.current.copyToClipboard(
          Promise.resolve('https://link'),
          'Link copied',
        );
      });

      expect(mockWrite).toHaveBeenCalledTimes(1);

      const [[clipboardItem]] = mockWrite.mock.calls[0];
      const blob = await clipboardItem.items['text/plain'];

      expect(await readBlobAsText(blob)).toBe('https://link');

      await act(async () => {
        await copyPromise;
      });

      expect(mockWriteText).not.toHaveBeenCalled();
      expect(mockEnqueueToast).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'success', children: 'Link copied' }),
      );
    });

    it('should fall back to writeText when ClipboardItem is unavailable', async () => {
      const { result } = renderUseCopyToClipboard();

      await act(async () => {
        await result.current.copyToClipboard(Promise.resolve('https://link'));
      });

      expect(mockWrite).not.toHaveBeenCalled();
      expect(mockWriteText).toHaveBeenCalledWith('https://link');
    });

    it('should enqueue an error toast when the value rejects', async () => {
      const { result } = renderUseCopyToClipboard();

      await act(async () => {
        await result.current.copyToClipboard(Promise.reject(new Error('nope')));
      });

      expect(mockEnqueueToast).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          children: "Couldn't copy to clipboard",
        }),
      );
    });
  });

  describe('copyToClipboard', () => {
    it('should copy the text and enqueue the default success toast', async () => {
      const { result } = renderUseCopyToClipboard();

      await act(async () => {
        await result.current.copyToClipboard('hello clipboard');
      });

      expect(mockWriteText).toHaveBeenCalledWith('hello clipboard');
      expect(mockEnqueueToast).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          children: 'Copied to clipboard',
        }),
      );
    });

    it('should enqueue the provided message instead of the default one', async () => {
      const { result } = renderUseCopyToClipboard();

      await act(async () => {
        await result.current.copyToClipboard('hello', 'Email copied');
      });

      expect(mockEnqueueToast).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          children: 'Email copied',
        }),
      );
    });
  });

  describe('copyToClipboardWithoutSuccessToast', () => {
    it('should copy the text without enqueuing any toast', async () => {
      const { result } = renderUseCopyToClipboard();

      await act(async () => {
        await result.current.copyToClipboardWithoutSuccessToast(
          'hello clipboard',
        );
      });

      expect(mockWriteText).toHaveBeenCalledWith('hello clipboard');
      expect(mockEnqueueToast).not.toHaveBeenCalled();
    });

    it('should enqueue an error toast when the write fails', async () => {
      mockWriteText.mockRejectedValue(new Error('denied'));

      const { result } = renderUseCopyToClipboard();

      await act(async () => {
        await result.current.copyToClipboardWithoutSuccessToast('hello');
      });

      expect(mockEnqueueToast).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          children: "Couldn't copy to clipboard",
        }),
      );
    });

    it('should not write to the clipboard outside a secure context', async () => {
      setIsSecureContext(false);

      const { result } = renderUseCopyToClipboard();

      await act(async () => {
        await result.current.copyToClipboardWithoutSuccessToast('hello');
      });

      expect(mockWriteText).not.toHaveBeenCalled();
      expect(mockEnqueueToast).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'error' }),
      );
    });
  });
});
