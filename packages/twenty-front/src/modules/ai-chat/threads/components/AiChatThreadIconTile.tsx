import { styled } from '@linaria/react';
import { getIconTileColorShades } from 'twenty-ui/components/data-display';
import { useIcons } from 'twenty-ui/icon/provider';
import {
  AVATAR_PROPERTIES_BY_SIZE,
  type AvatarSize,
} from 'twenty-ui/primitives/data-display';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { AI_CHAT_THREAD_ICON_SIZES } from '@/ai-chat/threads/constants/AiChatThreadIconSizes';

const StyledTile = styled.div<{
  $size: string;
  $backgroundColor: string;
  $color: string;
}>`
  align-items: center;
  background: ${({ $backgroundColor }) => $backgroundColor};
  border-radius: ${themeCssVariables.border.radius.rounded};
  color: ${({ $color }) => $color};
  display: flex;
  flex-shrink: 0;
  height: ${({ $size }) => $size};
  justify-content: center;
  width: ${({ $size }) => $size};
`;

type AiChatThreadIconTileProps = {
  icon: string;
  color: string | null | undefined;
  size?: AvatarSize;
};

export const AiChatThreadIconTile = ({
  icon,
  color,
  size = 'lg',
}: AiChatThreadIconTileProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const Icon = getIcon(icon);
  const { backgroundColor, iconColor } = getIconTileColorShades(color);

  return (
    <StyledTile
      aria-hidden
      $size={AVATAR_PROPERTIES_BY_SIZE[size].width}
      $backgroundColor={backgroundColor}
      $color={iconColor}
    >
      <Icon
        size={AI_CHAT_THREAD_ICON_SIZES[size]}
        stroke={theme.icon.stroke.md}
      />
    </StyledTile>
  );
};
