import { useDropzone } from 'react-dropzone';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { IconUpload } from '@/ui/display/icon';

const StyledContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.secondary};
  border: ${({ theme }) => `2px dashed ${theme.border.color.strong}`};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  text-align: center;
`;

const StyledUploadDragTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  line-height: ${({ theme }) => theme.text.lineHeight.md};
  margin-bottom: 8px;
`;

const StyledUploadDragSubTitle = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  line-height: ${({ theme }) => theme.text.lineHeight.md};
`;

const StyledUploadIcon = styled(IconUpload)`
  color: ${({ theme }) => theme.font.color.tertiary};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

type DropZoneProps = {
  setIsDraggingFile: (drag: boolean) => void;
  onUploadFile: (file: File) => void;
};

export const DropZone = ({
  setIsDraggingFile,
  onUploadFile,
}: DropZoneProps) => {
  const theme = useTheme();
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
          <input
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...getInputProps()}
          />
          <StyledUploadIcon
            stroke={theme.icon.stroke.sm}
            size={theme.icon.size.lg}
          />
          <StyledUploadDragTitle>Upload a file</StyledUploadDragTitle>
          <StyledUploadDragSubTitle>
            Drag and Drop Here
          </StyledUploadDragSubTitle>
        </>
      )}
    </StyledContainer>
  );
};
