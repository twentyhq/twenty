import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { useDropzone } from 'react-dropzone';

import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { IconUpload } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

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

const StyledUploadIconContainer = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
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
  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();
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
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...getRootProps()}
    >
      {isDragActive && (
        <>
          <input
            // oxlint-disable-next-line react/jsx-props-no-spreading
            {...getInputProps()}
          />
          <StyledUploadIconContainer>
            <IconUpload
              stroke={theme.icon.stroke.sm}
              size={theme.icon.size.lg}
            />
          </StyledUploadIconContainer>
          <StyledUploadDragTitle>{t`Upload files`}</StyledUploadDragTitle>
          <StyledUploadDragSubTitle>
            {t`Drag and Drop Here`}
          </StyledUploadDragSubTitle>
        </>
      )}
    </StyledContainer>
  );
};
