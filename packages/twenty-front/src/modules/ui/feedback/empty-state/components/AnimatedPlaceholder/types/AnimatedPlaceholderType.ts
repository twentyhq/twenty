import { type BACKGROUND } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/constants/Background';
import { type MOVING_IMAGE } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/constants/MovingImage';

export type AnimatedPlaceholderType =
  | keyof typeof BACKGROUND
  | keyof typeof MOVING_IMAGE;
