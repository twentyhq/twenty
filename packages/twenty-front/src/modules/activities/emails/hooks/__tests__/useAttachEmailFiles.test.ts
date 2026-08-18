import { act, renderHook, waitFor } from '@testing-library/react';
import { type EmailAttachment } from 'twenty-shared/types';

import { useAttachEmailFiles } from '@/activities/emails/hooks/useAttachEmailFiles';
import { useUploadEmailAttachment } from '@/activities/emails/hooks/useUploadEmailAttachment';
import { useFileUpload } from '@/file-upload/hooks/useFileUpload';

jest.mock('@/activities/emails/hooks/useUploadEmailAttachment', () => ({
  useUploadEmailAttachment: jest.fn(),
}));

jest.mock('@/file-upload/hooks/useFileUpload', () => ({
  useFileUpload: jest.fn(),
}));

const mockUseUploadEmailAttachment = useUploadEmailAttachment as jest.Mock;
const mockUseFileUpload = useFileUpload as jest.Mock;

const buildAttachment = (id: string): EmailAttachment =>
  ({ id, name: `${id}.pdf` }) as EmailAttachment;

// Captures the onUpload callback the hook hands to the file picker, so a test
// can drive an upload the way the picker would.
const setup = (uploadEmailAttachment: jest.Mock) => {
  let triggerUpload: ((files: File[]) => Promise<void>) | undefined;

  mockUseUploadEmailAttachment.mockReturnValue({ uploadEmailAttachment });
  mockUseFileUpload.mockReturnValue({
    openFileUpload: ({
      onUpload,
    }: {
      onUpload: (files: File[]) => Promise<void>;
    }) => {
      triggerUpload = onUpload;
    },
  });

  const onFilesAttached = jest.fn();
  const view = renderHook(() => useAttachEmailFiles({ onFilesAttached }));

  act(() => {
    view.result.current.openAttachmentPicker();
  });

  return { view, onFilesAttached, getTriggerUpload: () => triggerUpload };
};

describe('useAttachEmailFiles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should flag uploads as pending until they resolve', async () => {
    let resolveUpload: (attachment: EmailAttachment) => void = () => {};
    const uploadEmailAttachment = jest.fn(
      () =>
        new Promise<EmailAttachment>((resolve) => {
          resolveUpload = resolve;
        }),
    );

    const { view, getTriggerUpload } = setup(uploadEmailAttachment);

    expect(view.result.current.isUploadingAttachments).toBe(false);

    let uploadPromise: Promise<void> | undefined;
    act(() => {
      uploadPromise = getTriggerUpload()?.([new File([], 'a.pdf')]);
    });

    await waitFor(() => {
      expect(view.result.current.isUploadingAttachments).toBe(true);
    });

    await act(async () => {
      resolveUpload(buildAttachment('a'));
      await uploadPromise;
    });

    expect(view.result.current.isUploadingAttachments).toBe(false);
  });

  it('should append uploads against the latest attachments rather than a captured list', async () => {
    const uploadEmailAttachment = jest.fn(async () => buildAttachment('new'));

    const { onFilesAttached, getTriggerUpload } = setup(uploadEmailAttachment);

    await act(async () => {
      await getTriggerUpload()?.([new File([], 'new.pdf')]);
    });

    expect(onFilesAttached).toHaveBeenCalledTimes(1);

    const appendToPreviousFiles = onFilesAttached.mock.calls[0][0];

    // The setter is called with an updater, so whatever the list holds when the
    // upload settles is what gets appended to.
    expect(typeof appendToPreviousFiles).toBe('function');
    expect(appendToPreviousFiles([buildAttachment('kept')])).toEqual([
      buildAttachment('kept'),
      buildAttachment('new'),
    ]);
  });

  it('should not touch the attachments when every upload fails', async () => {
    const uploadEmailAttachment = jest.fn(async () => undefined);

    const { view, onFilesAttached, getTriggerUpload } = setup(
      uploadEmailAttachment,
    );

    await act(async () => {
      await getTriggerUpload()?.([new File([], 'broken.pdf')]);
    });

    expect(onFilesAttached).not.toHaveBeenCalled();
    expect(view.result.current.isUploadingAttachments).toBe(false);
  });
});
