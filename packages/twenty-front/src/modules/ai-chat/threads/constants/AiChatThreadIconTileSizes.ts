import { type AvatarSize } from 'twenty-ui/primitives/data-display';

export const AI_CHAT_THREAD_ICON_TILE_SIZES: Record<
  AvatarSize,
  { tile: number; icon: number }
> = {
  xxl: { tile: 40, icon: 24 },
  xl: { tile: 32, icon: 20 },
  lg: { tile: 24, icon: 16 },
  md: { tile: 16, icon: 12 },
  sm: { tile: 14, icon: 10 },
  xs: { tile: 12, icon: 8 },
};
