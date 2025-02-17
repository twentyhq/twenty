import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import '@cyntler/react-doc-viewer/dist/index.css';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { getFileNameAndExtension } from '~/utils/file/getFileNameAndExtension';

const StyledDocumentViewerContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 200px);
  min-height: 500px;
  width: 100%;
  background: ${({ theme }) => theme.background.secondary};

  .react-doc-viewer {
    height: 100%;
    width: 100%;
    overflow: auto;
    background: none;
  }

  #react-doc-viewer #header-bar {
    display: none;
  }

  #react-doc-viewer #pdf-controls {
    display: none !important;
  }
`;

type DocumentViewerProps = {
  documentName: string;
  documentUrl: string;
};

export const PREVIEWABLE_EXTENSIONS = [
  'bmp',
  'csv',
  'odt',
  'doc',
  'docx',
  'gif',
  'htm',
  'html',
  'jpg',
  'jpeg',
  'pdf',
  'png',
  'ppt',
  'pptx',
  'tiff',
  'txt',
  'xls',
  'xlsx',
  'mp4',
  'webp',
];

const MIME_TYPE_MAPPING: Record<
  (typeof PREVIEWABLE_EXTENSIONS)[number],
  string
> = {
  bmp: 'image/bmp',
  csv: 'text/csv',
  odt: 'application/vnd.oasis.opendocument.text',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  gif: 'image/gif',
  htm: 'text/html',
  html: 'text/html',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  pdf: 'application/pdf',
  png: 'image/png',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  tiff: 'image/tiff',
  txt: 'text/plain',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  mp4: 'video/mp4',
  webp: 'image/webp',
};

export const DocumentViewer = ({
  documentName,
  documentUrl,
}: DocumentViewerProps) => {
  const theme = useTheme();

  const { extension } = getFileNameAndExtension(documentName);
  const fileExtension = extension?.toLowerCase().replace('.', '') ?? '';
  const mimeType = PREVIEWABLE_EXTENSIONS.includes(fileExtension)
    ? MIME_TYPE_MAPPING[fileExtension]
    : undefined;

  return (
    <StyledDocumentViewerContainer>
      <DocViewer
        documents={[
          {
            uri: documentUrl,
            fileName: documentName,
            fileType: mimeType,
          },
        ]}
        pluginRenderers={DocViewerRenderers}
        style={{ height: '100%' }}
        config={{
          header: {
            disableHeader: true,
            disableFileName: true,
            retainURLParams: false,
          },
          pdfVerticalScrollByDefault: true,
          pdfZoom: {
            defaultZoom: 1,
            zoomJump: 0.1,
          },
        }}
        theme={{
          primary: theme.background.primary,
          secondary: theme.background.secondary,
          tertiary: theme.background.tertiary,
          textPrimary: theme.font.color.primary,
          textSecondary: theme.font.color.secondary,
          textTertiary: theme.font.color.tertiary,
          disableThemeScrollbar: true,
        }}
      />
    </StyledDocumentViewerContainer>
  );
};
