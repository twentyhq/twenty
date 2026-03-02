import { useContext } from 'react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useDropzone } from 'react-dropzone';

import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { IconUpload } from 'twenty-ui/display';
import { ThemeContext } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border: 2px dashed ${themeCssVariables.border.color.strong};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  text-align: center;
`;

const StyledUploadDragTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.medium};
  line-height: ${themeCssVariables.text.lineHeight.md};
  margin-bottom: 8px;
`;

const StyledUploadDragSubTitle = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  line-height: ${themeCssVariables.text.lineHeight.md};
`;

const StyledUploadIcon = styled(IconUpload)`
  color: ${themeCssVariables.font.color.tertiary};
  margin-bottom: ${themeCssVariables.spacing[3]};
`;

type DropZoneProps = {
  setIsDraggingFile: (drag: boolean) => void;
  onUploadFiles: (files: File[]) => void;
};

export const DropZone = ({
  setIsDraggingFile,
  onUploadFiles,
}: DropZoneProps) => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const { maxFileSize } = useSpreadsheetImportInternal();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    noClick: true,
    noKeyboard: true,
    multiple: true,
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
    onDropAccepted: async (files) => {
      onUploadFiles(files);
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
          <StyledUploadDragTitle>{t`Upload files`}</StyledUploadDragTitle>
          <StyledUploadDragSubTitle>
            {t`Drag and Drop Here`}
          </StyledUploadDragSubTitle>
        </>
      )}
    </StyledContainer>
  );
};
