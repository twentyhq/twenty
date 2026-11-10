import { act, renderHook, waitFor } from '@testing-library/react';

import { useChatThreadDraftAttachments } from '@/activities/emails/hooks/useChatThreadDraftAttachments';

const mockUploadFile = jest.fn();
const mockEnqueueToast = jest.fn();

jest.mock('@/file/hooks/useDirectFileUpload', () => ({
  useDirectFileUpload: () => ({ uploadFile: mockUploadFile }),
}));

jest.mock('@/file-upload/hooks/useFileUpload', () => ({
  useFileUpload: () => ({ openFileUpload: jest.fn() }),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: () => ({
    objectMetadataItem: {
      fields: [{ id: 'file-field-id', type: 'FILES', name: 'file' }],
    },
  }),
}));

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: () => true,
}));

jest.mock('twenty-ui/components/feedback', () => ({
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));

jest.mock('@lingui/react/macro', () => ({
  useLingui: () => ({
    t: (strings: TemplateStringsArray, ...values: unknown[]) =>
      String.raw({ raw: strings }, ...values),
  }),
}));

const buildFile = (name: string) => new File(['content'], name);

describe('useChatThreadDraftAttachments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adds each file to the draft as soon as its own upload finishes', async () => {
    let finishSlowUpload: (value: { id: string; url: string }) => void = () =>
      undefined;

    mockUploadFile.mockImplementation((file: File) =>
      file.name === 'slow.mp4'
        ? new Promise((resolve) => {
            finishSlowUpload = resolve;
          })
        : Promise.resolve({ id: 'fast-id', url: 'https://twenty.test/fast' }),
    );

    const { result } = renderHook(() => useChatThreadDraftAttachments());

    act(() => {
      result.current.attachFiles([
        buildFile('fast.png'),
        buildFile('slow.mp4'),
      ]);
    });

    await waitFor(() =>
      expect(
        result.current.draftAttachments.map(({ filename }) => filename),
      ).toEqual(['fast.png']),
    );
    expect(result.current.uploadingFiles.map(({ name }) => name)).toEqual([
      'slow.mp4',
    ]);

    await act(async () => {
      finishSlowUpload({ id: 'slow-id', url: 'https://twenty.test/slow' });
    });

    await waitFor(() =>
      expect(result.current.draftAttachments).toHaveLength(2),
    );
    expect(result.current.uploadingFiles).toEqual([]);
  });

  it('uploads no more files than a message can carry', async () => {
    mockUploadFile.mockImplementation((file: File) =>
      Promise.resolve({ id: file.name, url: 'https://twenty.test/file' }),
    );

    const { result } = renderHook(() => useChatThreadDraftAttachments());

    await act(async () => {
      await result.current.attachFiles(
        Array.from({ length: 22 }, (_, index) => buildFile(`${index}.png`)),
      );
    });

    expect(mockUploadFile).toHaveBeenCalledTimes(20);
    expect(result.current.draftAttachments).toHaveLength(20);
    expect(mockEnqueueToast).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.attachFiles([buildFile('one-more.png')]);
    });

    expect(mockUploadFile).toHaveBeenCalledTimes(20);
    expect(mockEnqueueToast).toHaveBeenCalledTimes(2);
  });
});
