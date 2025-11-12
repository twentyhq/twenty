import { getFileType } from '@/activities/files/utils/getFileType';
import { IconMapping } from '@/file/utils/fileIconMappings';
import { useFileCategoryColors } from '@/file/hooks/useFileCategoryColors';
import { type WorkflowAttachmentType } from '@/workflow/workflow-steps/workflow-actions/email-action/types/WorkflowAttachmentType';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { AvatarChip } from 'twenty-ui/components';
import { IconX } from 'twenty-ui/display';

type WorkflowAttachmentChipProps = {
  file: WorkflowAttachmentType;
  onRemove: () => void;
  readonly?: boolean;
};

const StyledChip = styled.div<{ deletable: boolean }>`
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.light};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  column-gap: ${({ theme }) => theme.spacing(1)};
  display: inline-flex;
  flex-direction: row;
  flex-shrink: 0;
  max-width: 140px;
  padding-left: ${({ theme }) => theme.spacing(1)};
`;

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledDelete = styled.button`
  height: 20px;
  width: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
  padding: 0;
  cursor: pointer;
  font-size: ${({ theme }) => theme.font.size.sm};
  user-select: none;
  flex-shrink: 0;
  background: none;
  border: none;
  color: ${({ theme }) => theme.font.color.tertiary};
  border-top-right-radius: ${({ theme }) => theme.border.radius.sm};
  border-bottom-right-radius: ${({ theme }) => theme.border.radius.sm};

  &:hover {
    background-color: ${({ theme }) => theme.background.transparent.medium};
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

export const WorkflowAttachmentChip = ({
  file,
  onRemove,
  readonly = false,
}: WorkflowAttachmentChipProps) => {
  const iconColors = useFileCategoryColors();
  const theme = useTheme();

  return (
    <StyledChip data-chip deletable={!readonly}>
      <AvatarChip
        Icon={IconMapping[getFileType(file.name)]}
        IconBackgroundColor={iconColors[getFileType(file.name)]}
      />
      <StyledLabel title={file.name}>{file.name}</StyledLabel>

      {!readonly && (
        <StyledDelete onClick={onRemove}>
          <IconX size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
        </StyledDelete>
      )}
    </StyledChip>
  );
};
