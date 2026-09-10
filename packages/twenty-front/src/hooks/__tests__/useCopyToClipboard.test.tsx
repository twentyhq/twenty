import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, renderHook } from '@testing-library/react';

import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const mockEnqueueToast = jest.fn();

jest.mock('twenty-ui/feedback', () => ({
  ...jest.requireActual('twenty-ui/feedback'),
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));

const mockWriteText = jest.fn();

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
    // jsdom ships no clipboard implementation
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: mockWriteText },
    });
    setIsSecureContext(true);
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
          variant: 'success',
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
          variant: 'success',
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
          variant: 'error',
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
        expect.objectContaining({ variant: 'error' }),
      );
    });
  });
});
