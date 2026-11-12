import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';

import { ChatMessageImageGrid } from '@/chat/components/ChatMessageImageGrid';
import { isAttachmentPreviewEnabledState } from '@/client-config/states/isAttachmentPreviewEnabledState';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { GlobalFilePreviewModal } from '@/ui/field/display/components/GlobalFilePreviewModal';

jest.mock('@/settings/roles/hooks/useHasPermissionFlag');

const PHOTOS: FieldFilesValue[] = [1, 2, 3, 4, 5, 6].map((photoNumber) => ({
  fileId: `photo-${photoNumber}`,
  label: `photo-${photoNumber}.png`,
  extension: '.png',
  url: `https://example.com/photo-${photoNumber}.png`,
}));

const renderImageGrid = (files: FieldFilesValue[]) => {
  const store = createStore();

  store.set(isAttachmentPreviewEnabledState.atom, true);

  render(
    <Provider store={store}>
      <I18nProvider i18n={i18n}>
        <ChatMessageImageGrid files={files} />
        <GlobalFilePreviewModal />
      </I18nProvider>
    </Provider>,
  );
};

const getPreviewTitle = () =>
  screen.findByRole('heading', { name: /photo-\d\.png/ });

describe('ChatMessageImageGrid', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.mocked(useHasPermissionFlag).mockReturnValue(true);
    // the preview document viewer fetches the file, which jsdom does not provide
    global.fetch = jest.fn(() => new Promise<Response>(() => {}));
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('shows four tiles and a tile for the remaining images', () => {
    renderImageGrid(PHOTOS);

    expect(
      screen.getByRole('button', { name: 'photo-3.png' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Show 3 more images' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'photo-5.png' }),
    ).not.toBeInTheDocument();
  });

  it('opens the preview on the first hidden image and moves through every image', async () => {
    renderImageGrid(PHOTOS);

    await userEvent.click(
      screen.getByRole('button', { name: 'Show 3 more images' }),
    );

    expect(await getPreviewTitle()).toHaveTextContent('photo-4.png');
    expect(screen.getByText('4 / 6')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Next file' }));
    await userEvent.click(screen.getByRole('button', { name: 'Next file' }));

    expect(await getPreviewTitle()).toHaveTextContent('photo-6.png');
    expect(screen.getByRole('button', { name: 'Next file' })).toBeDisabled();

    await userEvent.keyboard('{ArrowLeft}');

    expect(await getPreviewTitle()).toHaveTextContent('photo-5.png');
    expect(screen.getByText('5 / 6')).toBeInTheDocument();
  });

  it('starts the preview on the clicked tile', async () => {
    renderImageGrid(PHOTOS.slice(0, 3));

    await userEvent.click(screen.getByRole('button', { name: 'photo-1.png' }));

    expect(await getPreviewTitle()).toHaveTextContent('photo-1.png');
    expect(
      screen.getByRole('button', { name: 'Previous file' }),
    ).toBeDisabled();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });
});
