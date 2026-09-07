import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, renderHook } from '@testing-library/react';

import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const mockEnqueueSuccessSnackBar = jest.fn();
const mockEnqueueErrorSnackBar = jest.fn();

jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar', () => ({
  useSnackBar: () => ({
    enqueueSuccessSnackBar: mockEnqueueSuccessSnackBar,
    enqueueErrorSnackBar: mockEnqueueErrorSnackBar,
  }),
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
    it('should copy the text and enqueue the default success snack bar', async () => {
      const { result } = renderUseCopyToClipboard();

      await act(async () => {
        await result.current.copyToClipboard('hello clipboard');
      });

      expect(mockWriteText).toHaveBeenCalledWith('hello clipboard');
      expect(mockEnqueueSuccessSnackBar).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Copied to clipboard' }),
      );
    });

    it('should enqueue the provided message instead of the default one', async () => {
      const { result } = renderUseCopyToClipboard();

      await act(async () => {
        await result.current.copyToClipboard('hello', 'Email copied');
      });

      expect(mockEnqueueSuccessSnackBar).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Email copied' }),
      );
    });
  });

  describe('copyToClipboardWithoutSuccessSnackBar', () => {
    it('should copy the text without enqueuing any snack bar', async () => {
      const { result } = renderUseCopyToClipboard();

      await act(async () => {
        await result.current.copyToClipboardWithoutSuccessSnackBar(
          'hello clipboard',
        );
      });

      expect(mockWriteText).toHaveBeenCalledWith('hello clipboard');
      expect(mockEnqueueSuccessSnackBar).not.toHaveBeenCalled();
      expect(mockEnqueueErrorSnackBar).not.toHaveBeenCalled();
    });

    it('should enqueue an error snack bar when the write fails', async () => {
      mockWriteText.mockRejectedValue(new Error('denied'));

      const { result } = renderUseCopyToClipboard();

      await act(async () => {
        await result.current.copyToClipboardWithoutSuccessSnackBar('hello');
      });

      expect(mockEnqueueErrorSnackBar).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Couldn't copy to clipboard" }),
      );
    });

    it('should not write to the clipboard outside a secure context', async () => {
      setIsSecureContext(false);

      const { result } = renderUseCopyToClipboard();

      await act(async () => {
        await result.current.copyToClipboardWithoutSuccessSnackBar('hello');
      });

      expect(mockWriteText).not.toHaveBeenCalled();
      expect(mockEnqueueErrorSnackBar).toHaveBeenCalled();
    });
  });
});
