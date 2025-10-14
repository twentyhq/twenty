import { ActivityRow } from '@/activities/components/ActivityRow';
import { getFileType } from '@/activities/files/utils/getFileType';
import { FileIcon } from '@/file/components/FileIcon';
import { formatFileSize } from '@/file/utils/formatFileSize';
import styled from '@emotion/styled';
import { IconX, OverflowingTextWithTooltip } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';

type WorkflowFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  createdAt: string;
};

type WorkflowAttachmentRowProps = {
  file: WorkflowFile;
  onRemove: () => void;
  readonly?: boolean;
};

const StyledLeftContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  width: 100%;
  overflow: auto;
  flex: 1;
`;

const StyledRightContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledFileName = styled.div`
  flex: 1;
  overflow: hidden;
`;

const StyledFileSize = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

export const WorkflowAttachmentRow = ({
  file,
  onRemove,
  readonly = false,
}: WorkflowAttachmentRowProps) => {
  const attachmentType = getFileType(file.name);

  return (
    <ActivityRow disabled>
      <StyledLeftContent>
        <FileIcon fileType={attachmentType} />
        <StyledFileName>
          <OverflowingTextWithTooltip text={file.name} />
        </StyledFileName>
      </StyledLeftContent>
      <StyledRightContent>
        <StyledFileSize>{formatFileSize(file.size)}</StyledFileSize>
        {!readonly && (
          <IconButton
            Icon={IconX}
            size="small"
            variant="tertiary"
            onClick={onRemove}
          />
        )}
      </StyledRightContent>
    </ActivityRow>
  );
};
