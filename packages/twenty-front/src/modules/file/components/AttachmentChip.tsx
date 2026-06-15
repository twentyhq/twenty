import { styled } from '@linaria/react';
import { useContext } from 'react';
import { AvatarOrIcon } from 'twenty-ui/components';
import { IconX } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { getFileType } from '@/activities/files/utils/getFileType';
import { useFileCategoryColors } from '@/file/hooks/useFileCategoryColors';
import { IconMapping } from '@/file/utils/fileIconMappings';

type AttachmentChipProps = {
  file: { id: string; name: string };
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
  align-items: center;
  background: none;
  border: none;
  border-bottom-right-radius: ${themeCssVariables.border.radius.sm};
  border-top-right-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.sm};
  height: 20px;
  justify-content: center;
  margin: 0;
  padding: 0;
  user-select: none;
  width: 20px;

  &:hover {
    background-color: ${themeCssVariables.background.transparent.medium};
    color: ${themeCssVariables.font.color.primary};
  }
`;

export const AttachmentChip = ({
  file,
  onRemove,
  readonly = false,
}: AttachmentChipProps) => {
  const { theme } = useContext(ThemeContext);
  const iconColors = useFileCategoryColors();

  const handleChipClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  const handleRemoveClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onRemove();
  };

  return (
    <StyledChip deletable={!readonly} onClick={handleChipClick}>
      <AvatarOrIcon
        Icon={IconMapping[getFileType(file.name)]}
        IconBackgroundColor={iconColors[getFileType(file.name)]}
      />
      <StyledLabel title={file.name}>{file.name}</StyledLabel>

      {!readonly && (
        <StyledDelete onClick={handleRemoveClick}>
          <IconX size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
        </StyledDelete>
      )}
    </StyledChip>
  );
};
