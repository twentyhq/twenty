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

  /* Hide all default controls and header */
  div[class*='header-bar'] {
    display: none !important;
  }

  div[class*='pdf-viewer-controls'] {
    display: none !important;
  }

  /* Remove any unwanted margins/padding */
  div[class*='pdf-viewer'] {
    margin: 0 !important;
    padding: 0 !important;
  }
`;

const StyledUnsupportedFileContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  width: 100%;
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const StyledTitle = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

const StyledHeaderActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

// Map of file extensions to MIME types
const MIME_TYPE_MAPPING: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  txt: 'text/plain',
  csv: 'text/csv',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  svg: 'image/svg+xml',
};

type DocumentViewerContentProps = {
  documentName: string;
  documentUrl: string;
};

export const DocumentViewerContent = ({
  documentName,
  documentUrl,
}: DocumentViewerContentProps) => {
  const { extension } = getFileNameAndExtension(documentName);
  const fileExtension = extension?.toLowerCase().replace('.', '') ?? '';
  const mimeType = MIME_TYPE_MAPPING[fileExtension];

  const theme = useTheme();

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
          disableThemeScrollbar: false,
        }}
      />
    </StyledDocumentViewerContainer>
  );
};

type DocumentViewerModalProps = DocumentViewerContentProps & {
  isOpen: boolean;
  onClose: () => void;
};

export const DocumentViewerModal = ({
  isOpen,
  documentName,
  documentUrl,
}: DocumentViewerModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <DocumentViewerContent
      documentName={documentName}
      documentUrl={documentUrl}
    />
  );
};
