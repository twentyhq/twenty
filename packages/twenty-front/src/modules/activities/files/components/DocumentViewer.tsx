import { PREVIEWABLE_EXTENSIONS } from '@/activities/files/const/previewable-extensions.const';
import { fetchCsvPreview } from '@/activities/files/utils/fetchCsvPreview';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import '@cyntler/react-doc-viewer/dist/index.css';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { getFileNameAndExtension } from '~/utils/file/getFileNameAndExtension';

const StyledDocumentViewerContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 200px);
  min-height: 500px;
  width: 100%;
  background: ${({ theme }) => theme.background.secondary};

  #react-doc-viewer #header-bar {
    display: none;
  }

  #react-doc-viewer #pdf-controls {
    display: none !important;
  }

  #react-doc-viewer,
  #proxy-renderer,
  #msdoc-renderer {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: auto;
    background: none;
  }
`;

type DocumentViewerProps = {
  documentName: string;
  documentUrl: string;
};

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
  const [csvPreview, setCsvPreview] = useState<string | undefined>(undefined);

  const { extension } = getFileNameAndExtension(documentName);
  const fileExtension = extension?.toLowerCase().replace('.', '') ?? '';
  const mimeType = PREVIEWABLE_EXTENSIONS.includes(fileExtension)
    ? MIME_TYPE_MAPPING[fileExtension]
    : undefined;

  useEffect(() => {
    if (fileExtension === 'csv') {
      fetchCsvPreview(documentUrl).then((content) => {
        setCsvPreview(content);
      });
    }
  }, [documentUrl, fileExtension]);

  if (fileExtension === 'csv' && !isDefined(csvPreview))
    return (
      <StyledDocumentViewerContainer>
        <Trans>Loading csv ... </Trans>
      </StyledDocumentViewerContainer>
    );

  return (
    <StyledDocumentViewerContainer>
      <DocViewer
        documents={[
          {
            uri:
              fileExtension === 'csv' && isDefined(csvPreview)
                ? window.URL.createObjectURL(
                    new Blob([csvPreview], { type: 'text/csv' }),
                  )
                : documentUrl,
            fileName: documentName,
            fileType: mimeType,
          },
        ]}
        pluginRenderers={DocViewerRenderers}
        style={{
          height: '100%',
          color: theme.font.color.primary,
          backgroundColor: theme.background.primary,
        }}
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
