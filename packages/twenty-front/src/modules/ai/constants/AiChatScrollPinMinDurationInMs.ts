import { ANIMATION } from 'twenty-ui/theme';

import { INBOX_SCROLL_PIN_ANIMATION_TAIL_MARGIN_IN_MS } from '@/ai/constants/AiChatScrollPinAnimationTailMarginInMs';

export const INBOX_SCROLL_PIN_MIN_DURATION_IN_MS =
  ANIMATION.duration.normal * 1000 +
  INBOX_SCROLL_PIN_ANIMATION_TAIL_MARGIN_IN_MS;
