import { getFileType } from '@/activities/files/utils/getFileType';
import { FileIcon } from '@/file/components/FileIcon';
import { formatFileSize } from '@/file/utils/formatFileSize';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconX } from 'twenty-ui/display';
import { Loader } from 'twenty-ui/feedback';
import { File as FileDocument } from '~/generated-metadata/graphql';

const StyledFileChip = styled.div`
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.lighter};
  border-radius: ${({ theme }) => theme.border.radius.md};
  height: 40px;
  border: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledFileIconContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  padding-inline: ${({ theme }) => theme.spacing(2)};
  overflow: hidden;
`;

const StyledFileInfo = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  border-left: 1px solid ${({ theme }) => theme.border.color.light};
  padding-inline: ${({ theme }) => theme.spacing(2)};
`;

const StyledFileName = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 125px;
`;

const StyledFileSize = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledRemoveIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding-inline: ${({ theme }) => theme.spacing(3)};
  border-left: 1px solid ${({ theme }) => theme.border.color.light};

  svg {
    cursor: pointer;
  }
`;

export const AgentChatFilePreview = ({
  file,
  onRemove,
  isUploading,
}: {
  file: File | FileDocument;
  onRemove?: () => void;
  isUploading?: boolean;
}) => {
  const theme = useTheme();

  return (
    <StyledFileChip key={file.name}>
      <StyledFileIconContainer>
        {isUploading ? (
          <Loader color="yellow" />
        ) : (
          <FileIcon fileType={getFileType(file.name)} />
        )}
      </StyledFileIconContainer>
      <StyledFileInfo>
        <StyledFileName title={file.name}>{file.name}</StyledFileName>
        <StyledFileSize>{formatFileSize(file.size)}</StyledFileSize>
      </StyledFileInfo>
      {onRemove && (
        <StyledRemoveIconContainer>
          <IconX
            size={theme.icon.size.md}
            color={theme.font.color.secondary}
            onClick={onRemove}
          />
        </StyledRemoveIconContainer>
      )}
    </StyledFileChip>
  );
};
