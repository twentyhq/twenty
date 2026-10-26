import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { useDropzone } from 'react-dropzone';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledFilesFieldDropZone = styled.div<{ isDragActive: boolean }>`
  border-radius: ${themeCssVariables.border.radius.md};
  outline: ${({ isDragActive }) =>
    isDragActive
      ? `1px dashed ${themeCssVariables.border.color.blue}`
      : 'none'};
  outline-offset: -1px;
  width: 100%;
`;

type FilesFieldDropZoneProps = {
  onDrop: (files: File[]) => void;
  children: ReactNode;
};

export const FilesFieldDropZone = ({
  onDrop,
  children,
}: FilesFieldDropZoneProps) => {
  const { getRootProps, isDragActive } = useDropzone({
    noClick: true,
    noKeyboard: true,
    multiple: true,
    onDropAccepted: onDrop,
  });

  return (
    <StyledFilesFieldDropZone
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...getRootProps()}
      isDragActive={isDragActive}
    >
      {children}
    </StyledFilesFieldDropZone>
  );
};
