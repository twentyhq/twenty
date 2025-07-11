import { AgentChatFile } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/agentChatUploadedFilesState';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconFile, IconPhoto, IconX } from 'twenty-ui/display';
import { Loader } from 'twenty-ui/feedback';

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
  padding-inline: ${({ theme }) => theme.spacing(1)};
  width: 40px;
`;

const StyledFileInfo = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  border-inline: 1px solid ${({ theme }) => theme.border.color.light};
  padding-inline: ${({ theme }) => theme.spacing(2)};
`;

const StyledFileName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
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
  width: 40px;

  svg {
    cursor: pointer;
  }
`;

const formatSize = (size: number) => {
  if (size > 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }
  if (size > 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${size} B`;
};

export const AgentChatFilePreview = ({
  file,
  onRemove,
  isUploading,
}: {
  file: File | AgentChatFile;
  onRemove: () => void;
  isUploading: boolean;
}) => {
  const theme = useTheme();

  return (
    <StyledFileChip key={file.name}>
      <StyledFileIconContainer>
        {isUploading ? (
          <Loader color="yellow" />
        ) : file.type.startsWith('image') ? (
          <IconPhoto size={theme.icon.size.lg} color={theme.color.yellow} />
        ) : (
          <IconFile size={theme.icon.size.lg} color={theme.color.gray} />
        )}
      </StyledFileIconContainer>
      <StyledFileInfo>
        <StyledFileName title={file.name}>{file.name}</StyledFileName>
        <StyledFileSize>{formatSize(file.size)}</StyledFileSize>
      </StyledFileInfo>
      <StyledRemoveIconContainer>
        <IconX
          size={theme.icon.size.md}
          color={theme.font.color.secondary}
          onClick={onRemove}
        />
      </StyledRemoveIconContainer>
    </StyledFileChip>
  );
};
