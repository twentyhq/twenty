import { type AttachmentFileCategory } from '@/activities/files/types/AttachmentFileCategory';
import { useFileIconColors } from '@/file/hooks/useFileIconColors';
import { IconMapping } from '@/file/utils/fileIconMappings';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext, useState } from 'react';
import { FILE_CATEGORIES, type FileCategory } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { AvatarOrIcon } from 'twenty-ui/components';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

type FileIconSize = 'small' | 'medium';

const THUMBNAIL_SIZE_PX_BY_FILE_ICON_SIZE: Record<FileIconSize, number> = {
  small: 14,
  medium: 24,
};

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

const StyledThumbnail = styled.img<{ sizePx: number }>`
  border-radius: ${themeCssVariables.border.radius.sm};
  flex-shrink: 0;
  height: ${({ sizePx }) => sizePx}px;
  object-fit: cover;
  width: ${({ sizePx }) => sizePx}px;
`;

type FileIconProps = {
  fileCategory: AttachmentFileCategory | FileCategory;
  size?: FileIconSize;
  thumbnailUrl?: string;
};

export const FileIcon = ({
  fileCategory,
  size = 'medium',
  thumbnailUrl,
}: FileIconProps) => {
  const { theme } = useContext(ThemeContext);
  const iconColors = useFileIconColors();
  const Icon = IconMapping[fileCategory];
  const [failedThumbnailUrl, setFailedThumbnailUrl] = useState<string>();

  const shouldRenderThumbnail =
    fileCategory === FILE_CATEGORIES.IMAGE &&
    isNonEmptyString(thumbnailUrl) &&
    failedThumbnailUrl !== thumbnailUrl;

  if (shouldRenderThumbnail) {
    return (
      <StyledThumbnail
        alt=""
        aria-hidden
        sizePx={THUMBNAIL_SIZE_PX_BY_FILE_ICON_SIZE[size]}
        src={thumbnailUrl}
        onError={() => setFailedThumbnailUrl(thumbnailUrl)}
      />
    );
  }

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
      {isDefined(Icon) && (
        <Icon size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
      )}
    </StyledIconContainer>
  );
};
