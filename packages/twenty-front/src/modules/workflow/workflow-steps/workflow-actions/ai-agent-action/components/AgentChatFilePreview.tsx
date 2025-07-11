import { AgentChatFile } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/agentChatUploadedFilesState';
import { getFileIcon } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/getFileIcon';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';
import { IconX } from 'twenty-ui/display';
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
  width: 32px;
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
  width: 40px;
  border-left: 1px solid ${({ theme }) => theme.border.color.light};

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
  onRemove?: () => void;
  isUploading?: boolean;
}) => {
  const theme = useTheme();

  const renderIcon = () => {
    if (isDefined(isUploading) && isUploading) {
      return <Loader color="yellow" />;
    }

    return getFileIcon(file, theme);
  };

  return (
    <StyledFileChip key={file.name}>
      <StyledFileIconContainer>{renderIcon()}</StyledFileIconContainer>
      <StyledFileInfo>
        <StyledFileName title={file.name}>{file.name}</StyledFileName>
        <StyledFileSize>{formatSize(file.size)}</StyledFileSize>
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
