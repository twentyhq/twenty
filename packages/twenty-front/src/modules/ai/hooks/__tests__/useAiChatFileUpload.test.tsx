import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, renderHook } from '@testing-library/react';
import { getDefaultStore } from 'jotai';
import { type ReactNode } from 'react';

import { useAiChatFileUpload } from '@/ai/hooks/useAiChatFileUpload';
import { agentChatSelectedFilesState } from '@/ai/states/agentChatSelectedFilesState';
import { agentChatUploadAbortControllersState } from '@/ai/states/agentChatUploadAbortControllersState';
import { agentChatUploadedFilesState } from '@/ai/states/agentChatUploadedFilesState';

const enqueueToast = jest.fn();
const uploadFile = jest.fn();

jest.mock('@/file/hooks/useDirectFileUpload', () => ({
  useDirectFileUpload: () => ({ uploadFile }),
}));

jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
  useToast: () => ({ enqueueToast }),
}));

// Resolves when the test says so, and rejects like fetch does once aborted.
const mockPendingUpload = () => {
  let resolveUpload: (value: { url: string; id: string }) => void = () => {};

  uploadFile.mockImplementationOnce(
    (_file: File, { signal }: { signal: AbortSignal }) =>
      new Promise((resolve, reject) => {
        resolveUpload = resolve;
        signal.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError')),
        );
      }),
  );

  return (value: { url: string; id: string }) => resolveUpload(value);
};

const store = getDefaultStore();

const Wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

const renderUseAiChatFileUpload = () =>
  renderHook(() => useAiChatFileUpload(), { wrapper: Wrapper });

describe('useAiChatFileUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    store.set(agentChatSelectedFilesState.atom, []);
    store.set(agentChatUploadedFilesState.atom, []);
    store.set(agentChatUploadAbortControllersState.atom, new Map());
  });

  it('should show a file as uploading until it is uploaded', async () => {
    const file = new File(['brief'], 'brief.pdf', { type: 'application/pdf' });
    const finishUpload = mockPendingUpload();
    const { result } = renderUseAiChatFileUpload();

    let upload: Promise<void> = Promise.resolve();
    act(() => {
      upload = result.current.uploadFiles([file]);
    });

    expect(store.get(agentChatSelectedFilesState.atom)).toEqual([file]);

    await act(async () => {
      finishUpload({ url: 'https://files/brief.pdf', id: 'file-id' });
      await upload;
    });

    expect(store.get(agentChatSelectedFilesState.atom)).toEqual([]);
    expect(store.get(agentChatUploadedFilesState.atom)).toEqual([
      expect.objectContaining({ filename: 'brief.pdf', fileId: 'file-id' }),
    ]);
  });

  it('should abort only the cancelled file, without a failure toast', async () => {
    const cancelledFile = new File(['a'], 'notes.txt');
    const keptFile = new File(['b'], 'notes.txt');
    mockPendingUpload();
    const finishKeptUpload = mockPendingUpload();
    const { result } = renderUseAiChatFileUpload();

    let upload: Promise<void> = Promise.resolve();
    act(() => {
      upload = result.current.uploadFiles([cancelledFile, keptFile]);
    });

    await act(async () => {
      result.current.cancelUpload(cancelledFile);
      finishKeptUpload({ url: 'https://files/notes.txt', id: 'kept-id' });
      await upload;
    });

    expect(store.get(agentChatUploadedFilesState.atom)).toEqual([
      expect.objectContaining({ fileId: 'kept-id' }),
    ]);
    expect(enqueueToast).not.toHaveBeenCalled();
  });

  it('should abort every upload in flight', async () => {
    mockPendingUpload();
    mockPendingUpload();
    const { result } = renderUseAiChatFileUpload();

    let upload: Promise<void> = Promise.resolve();
    act(() => {
      upload = result.current.uploadFiles([
        new File(['a'], 'a.txt'),
        new File(['b'], 'b.txt'),
      ]);
    });

    await act(async () => {
      result.current.cancelAllUploads();
      await upload;
    });

    expect(store.get(agentChatUploadedFilesState.atom)).toEqual([]);
    expect(store.get(agentChatSelectedFilesState.atom)).toEqual([]);
    expect(store.get(agentChatUploadAbortControllersState.atom).size).toBe(0);
    expect(enqueueToast).not.toHaveBeenCalled();
  });

  it('should still report an upload that failed on its own', async () => {
    uploadFile.mockRejectedValueOnce(new Error('Network error'));
    const { result } = renderUseAiChatFileUpload();

    await act(async () => {
      await result.current.uploadFiles([new File(['a'], 'a.txt')]);
    });

    expect(enqueueToast).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'error' }),
    );
  });
});
