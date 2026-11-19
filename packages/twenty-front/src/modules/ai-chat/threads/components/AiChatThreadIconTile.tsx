import { styled } from '@linaria/react';
import { getIconTileColorShades } from 'twenty-ui/components/data-display';
import { useIcons } from 'twenty-ui/icon/provider';
import { type AvatarSize } from 'twenty-ui/primitives/data-display';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { AI_CHAT_THREAD_ICON_TILE_SIZES } from '@/ai-chat/threads/constants/AiChatThreadIconTileSizes';

const StyledTile = styled.div<{
  $size: number;
  $backgroundColor: string;
  $color: string;
}>`
  align-items: center;
  background: ${({ $backgroundColor }) => $backgroundColor};
  border-radius: ${themeCssVariables.border.radius.rounded};
  color: ${({ $color }) => $color};
  corner-shape: round;
  display: flex;
  flex-shrink: 0;
  height: ${({ $size }) => $size}px;
  justify-content: center;
  width: ${({ $size }) => $size}px;
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
  const sizes = AI_CHAT_THREAD_ICON_TILE_SIZES[size];

  return (
    <StyledTile
      aria-hidden
      $size={sizes.tile}
      $backgroundColor={backgroundColor}
      $color={iconColor}
    >
      <Icon size={sizes.icon} stroke={theme.icon.stroke.md} />
    </StyledTile>
  );
};
