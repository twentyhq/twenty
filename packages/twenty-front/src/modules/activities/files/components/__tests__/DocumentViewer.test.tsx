import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';

import { DocumentViewer } from '@/activities/files/components/DocumentViewer';

jest.mock('@cyntler/react-doc-viewer', () => () => (
  <div data-testid="doc-viewer" />
));

jest.mock('@/activities/files/utils/downloadFile', () => ({
  downloadFile: jest.fn(),
}));

const renderWithI18n = (node: ReactNode) =>
  render(<I18nProvider i18n={i18n}>{node}</I18nProvider>);

describe('DocumentViewer', () => {
  beforeAll(() => {
    i18n.load('en', {});
    i18n.activate('en');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('video preview', () => {
    it('renders loader initially while video is downloading/loading', () => {
      const { container } = renderWithI18n(
        <DocumentViewer
          documentName="test-video.mp4"
          documentUrl="https://example.com/test-video.mp4"
        />,
      );

      const videoElement = container.querySelector('video');
      expect(videoElement).toBeInTheDocument();
      expect(videoElement).toHaveAttribute(
        'src',
        'https://example.com/test-video.mp4',
      );
      expect(videoElement).toHaveStyle({ visibility: 'hidden' });
    });

    it('hides loader and shows video when video can play', () => {
      const { container } = renderWithI18n(
        <DocumentViewer
          documentName="test-video.mp4"
          documentUrl="https://example.com/test-video.mp4"
        />,
      );

      const videoElement = container.querySelector('video');
      expect(videoElement).toBeInTheDocument();

      fireEvent.canPlay(videoElement!);

      expect(videoElement).toHaveStyle({ visibility: 'visible' });
    });

    it('hides loader and shows video when loadeddata event fires', () => {
      const { container } = renderWithI18n(
        <DocumentViewer
          documentName="test-video.mp4"
          documentUrl="https://example.com/test-video.mp4"
        />,
      );

      const videoElement = container.querySelector('video');
      expect(videoElement).toBeInTheDocument();

      fireEvent.loadedData(videoElement!);

      expect(videoElement).toHaveStyle({ visibility: 'visible' });
    });

    it('transitions to "Preview Not Available" fallback when video errors', () => {
      const { container } = renderWithI18n(
        <DocumentViewer
          documentName="test-video.mp4"
          documentUrl="https://example.com/test-video.mp4"
        />,
      );

      const videoElement = container.querySelector('video');
      expect(videoElement).toBeInTheDocument();

      fireEvent.error(videoElement!);

      expect(container.querySelector('video')).not.toBeInTheDocument();
      expect(screen.getByText('Preview Not Available')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Download/i }),
      ).toBeInTheDocument();
    });
  });

  describe('non-previewable files', () => {
    it('renders "Preview Not Available" for unsupported formats', () => {
      renderWithI18n(
        <DocumentViewer
          documentName="archive.zip"
          documentUrl="https://example.com/archive.zip"
        />,
      );

      expect(screen.getByText('Preview Not Available')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Download/i }),
      ).toBeInTheDocument();
    });
  });
});
