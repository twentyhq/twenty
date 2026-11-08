import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';

import { downloadFile } from '@/activities/files/utils/downloadFile';
import { isAttachmentPreviewEnabledState } from '@/client-config/states/isAttachmentPreviewEnabledState';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { FileChip } from '@/ui/field/display/components/FileChip';
import { GlobalFilePreviewModal } from '@/ui/field/display/components/GlobalFilePreviewModal';
import { useOpenFilePreview } from '@/ui/field/display/hooks/useOpenFilePreview';

jest.mock('@/activities/files/utils/downloadFile');
jest.mock('@/settings/roles/hooks/useHasPermissionFlag');

const FILE: FieldFilesValue = {
  fileId: 'file-id',
  label: 'report.pdf',
  extension: 'pdf',
  url: 'https://example.com/report.pdf',
};

const ARCHIVE_FILE: FieldFilesValue = {
  fileId: 'archive-file-id',
  label: 'export.zip',
  extension: 'zip',
  url: 'https://example.com/export.zip',
};

const PreviewableFileChip = ({ file }: { file: FieldFilesValue }) => {
  const { openFilePreview } = useOpenFilePreview();

  return (
    <>
      <FileChip file={file} onClick={openFilePreview} />
      <GlobalFilePreviewModal />
    </>
  );
};

const renderFileChip = ({
  isAttachmentPreviewEnabled,
  file = FILE,
}: {
  isAttachmentPreviewEnabled: boolean;
  file?: FieldFilesValue;
}) => {
  const store = createStore();

  store.set(isAttachmentPreviewEnabledState.atom, isAttachmentPreviewEnabled);

  render(
    <Provider store={store}>
      <I18nProvider i18n={i18n}>
        <PreviewableFileChip file={file} />
      </I18nProvider>
    </Provider>,
  );
};

describe('useOpenFilePreview', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.mocked(downloadFile).mockResolvedValue(undefined);
    // the preview document viewer fetches the file, which jsdom does not provide
    global.fetch = jest.fn(() => new Promise<Response>(() => {}));
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('downloads the file when previews are disabled', async () => {
    jest.mocked(useHasPermissionFlag).mockReturnValue(true);
    renderFileChip({ isAttachmentPreviewEnabled: false });

    await userEvent.click(screen.getByText('report.pdf'));

    expect(downloadFile).toHaveBeenCalledTimes(1);
    expect(downloadFile).toHaveBeenCalledWith(FILE.url, FILE.label);
  });

  it('does not download the file without download permission when previews are disabled', async () => {
    jest.mocked(useHasPermissionFlag).mockReturnValue(false);
    renderFileChip({ isAttachmentPreviewEnabled: false });

    await userEvent.click(screen.getByText('report.pdf'));

    expect(downloadFile).not.toHaveBeenCalled();
  });

  it('offers a download in the preview with download permission', async () => {
    jest.mocked(useHasPermissionFlag).mockReturnValue(true);
    renderFileChip({ isAttachmentPreviewEnabled: true });

    await userEvent.click(screen.getByText('report.pdf'));

    expect(
      await screen.findByRole('button', { name: 'Close preview' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Download file' }),
    ).toBeInTheDocument();
  });

  it('hides the preview download without download permission', async () => {
    jest.mocked(useHasPermissionFlag).mockReturnValue(false);
    renderFileChip({ isAttachmentPreviewEnabled: true });

    await userEvent.click(screen.getByText('report.pdf'));

    expect(
      await screen.findByRole('button', { name: 'Close preview' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Download file' }),
    ).not.toBeInTheDocument();
  });

  it('offers a download for a file that cannot be previewed with download permission', async () => {
    jest.mocked(useHasPermissionFlag).mockReturnValue(true);
    renderFileChip({ isAttachmentPreviewEnabled: true, file: ARCHIVE_FILE });

    await userEvent.click(screen.getByText('export.zip'));

    expect(
      await screen.findByText('Preview Not Available'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Download File' }),
    ).toBeInTheDocument();
  });

  it('hides the download of a file that cannot be previewed without download permission', async () => {
    jest.mocked(useHasPermissionFlag).mockReturnValue(false);
    renderFileChip({ isAttachmentPreviewEnabled: true, file: ARCHIVE_FILE });

    await userEvent.click(screen.getByText('export.zip'));

    expect(
      await screen.findByText('Preview Not Available'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Download File' }),
    ).not.toBeInTheDocument();
  });
});
