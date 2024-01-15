import { useDropzone } from 'react-dropzone';
import styled from '@emotion/styled';

import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { IconUpload } from '@/ui/display/icon';

const StyledContainer = styled.div`
  align-items: center;
  background-position:
    0 0,
    0 0,
    100% 0,
    0 100%;
  background-repeat: no-repeat;
  background-size:
    2px 100%,
    100% 2px,
    2px 100%,
    100% 2px;
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  position: relative;
  height: 100%;
  border: ${({ theme }) => `2px dashed ${theme.border.color.strong}`};
`;

const StyledOverlay = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  bottom: 0px;
  left: 0px;
  position: absolute;
  right: 0px;
  top: 0px;
`;

const StyledUploadDragTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  line-height: ${({ theme }) => theme.text.lineHeight.md};
  margin-bottom: 8px;
  z-index: 1;
`;

const StyledUploadDragSubTitle = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  line-height: ${({ theme }) => theme.text.lineHeight.md};
  z-index: 1;
`;

const StyledUploadDragImage = styled.div`
  margin-bottom: 12px;
  z-index: 1;

  svg {
    color: ${({ theme }) => theme.font.color.tertiary};
    font-size: ${({ theme }) => theme.font.size.md};
  }
`;

type DropZoneProps = {
  setIsDraggingFile: (drag: boolean) => void;
  onUploadFile: (file: File) => void;
};

export const DropZone = ({
  setIsDraggingFile,
  onUploadFile,
}: DropZoneProps) => {
  const { maxFileSize } = useSpreadsheetImportInternal();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    noClick: true,
    noKeyboard: true,
    maxFiles: 1,
    maxSize: maxFileSize,
    onDragEnter: () => {
      setIsDraggingFile(true);
    },
    onDragLeave: () => {
      setIsDraggingFile(false);
    },
    onDrop: () => {
      setIsDraggingFile(false);
    },
    onDropAccepted: async ([file]) => {
      onUploadFile(file);
      setIsDraggingFile(false);
    },
  });

  return (
    <StyledContainer
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...getRootProps()}
    >
      {isDragActive && (
        <>
          <StyledOverlay />
          <input
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...getInputProps()}
          />
          <StyledUploadDragImage>
            <IconUpload />
          </StyledUploadDragImage>
          <StyledUploadDragTitle>Upload a file</StyledUploadDragTitle>
          <StyledUploadDragSubTitle>
            Drag and Drop Here
          </StyledUploadDragSubTitle>
        </>
      )}
    </StyledContainer>
  );
};
