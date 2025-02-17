import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import '@cyntler/react-doc-viewer/dist/index.css';
import styled from '@emotion/styled';
import { IconX, LightIconButton } from 'twenty-ui';

import { Modal } from '@/ui/layout/modal/components/Modal';
import { getFileNameAndExtension } from '~/utils/file/getFileNameAndExtension';

const StyledDocumentViewerContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 200px);
  min-height: 500px;
  width: 100%;

  // Override default react-doc-viewer styles
  .react-pdf__Document {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  // Container that holds the document
  > div {
    flex: 1;
    width: 100%;
    height: 100%;
    overflow: auto;
  }

  // Main document container
  .react-doc-viewer {
    height: 100%;
    width: 100%;
    overflow: hidden;
    background-color: ${({ theme }) => theme.background.secondary};
  }

  // Document wrapper
  .react-doc-viewer > div {
    height: 100%;
  }
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
          },
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
  onClose,
  documentName,
  documentUrl,
}: DocumentViewerModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <Modal size="large" isClosable onClose={onClose}>
      <Modal.Header>
        <StyledHeader>
          <StyledTitle>{documentName}</StyledTitle>
          <LightIconButton Icon={IconX} onClick={onClose} accent="tertiary" />
        </StyledHeader>
      </Modal.Header>
      <Modal.Content>
        <DocumentViewerContent
          documentName={documentName}
          documentUrl={documentUrl}
        />
      </Modal.Content>
    </Modal>
  );
};
