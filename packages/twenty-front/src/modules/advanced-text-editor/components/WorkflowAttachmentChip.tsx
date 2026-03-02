import { getFileType } from '@/activities/files/utils/getFileType';
import { useFileCategoryColors } from '@/file/hooks/useFileCategoryColors';
import { IconMapping } from '@/file/utils/fileIconMappings';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { type WorkflowAttachment } from 'twenty-shared/workflow';
import { AvatarOrIcon } from 'twenty-ui/components';
import { IconX } from 'twenty-ui/display';
import { ThemeContext } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type WorkflowAttachmentChipProps = {
  file: WorkflowAttachment;
  onRemove: () => void;
  readonly?: boolean;
};

const StyledChip = styled.div<{ deletable: boolean }>`
  align-items: center;
  background-color: ${themeCssVariables.background.transparent.light};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  column-gap: ${themeCssVariables.spacing[1]};
  display: inline-flex;
  flex-direction: row;
  flex-shrink: 0;
  max-width: 140px;
  padding-left: ${themeCssVariables.spacing[1]};
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
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
  font-size: ${themeCssVariables.font.size.sm};
  user-select: none;
  flex-shrink: 0;
  background: none;
  border: none;
  color: ${themeCssVariables.font.color.tertiary};
  border-top-right-radius: ${themeCssVariables.border.radius.sm};
  border-bottom-right-radius: ${themeCssVariables.border.radius.sm};

  &:hover {
    background-color: ${themeCssVariables.background.transparent.medium};
    color: ${themeCssVariables.font.color.primary};
  }
`;

export const WorkflowAttachmentChip = ({
  file,
  onRemove,
  readonly = false,
}: WorkflowAttachmentChipProps) => {
  const iconColors = useFileCategoryColors();
  const { theme } = useContext(ThemeContext);

  return (
    <StyledChip data-chip deletable={!readonly}>
      <AvatarOrIcon
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
