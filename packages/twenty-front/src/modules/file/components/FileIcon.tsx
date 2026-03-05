import { type AttachmentFileCategory } from '@/activities/files/types/AttachmentFileCategory';
import { useFileIconColors } from '@/file/hooks/useFileIconColors';
import { IconMapping } from '@/file/utils/fileIconMappings';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { type FileCategory } from 'twenty-shared/types';
import { AvatarOrIcon } from 'twenty-ui/components';
import { ThemeContext } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type FileIconSize = 'small' | 'medium';

const StyledIconContainer = styled.div<{
  background: string;
}>`
  align-items: center;
  background: ${({ background }) => background};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.grayScale.gray1};
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  padding: 5px;
`;

export const FileIcon = ({
  fileCategory,
  size = 'medium',
}: {
  fileCategory: AttachmentFileCategory | FileCategory;
  size?: FileIconSize;
}) => {
  const { theme } = useContext(ThemeContext);
  const iconColors = useFileIconColors();
  const Icon = IconMapping[fileCategory];

  if (size === 'small') {
    return (
      <AvatarOrIcon
        Icon={Icon}
        IconBackgroundColor={iconColors[fileCategory] ?? theme.color.gray}
      />
    );
  }

  return (
    <StyledIconContainer
      background={iconColors[fileCategory] ?? theme.color.gray}
    >
      {Icon && <Icon size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />}
    </StyledIconContainer>
  );
};
