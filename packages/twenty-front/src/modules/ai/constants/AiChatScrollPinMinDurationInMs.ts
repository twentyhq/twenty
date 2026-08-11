import { ANIMATION } from 'twenty-ui/theme';

import { AI_CHAT_SCROLL_PIN_ANIMATION_TAIL_MARGIN_IN_MS } from '@/ai/constants/AiChatScrollPinAnimationTailMarginInMs';

export const AI_CHAT_SCROLL_PIN_MIN_DURATION_IN_MS =
  ANIMATION.duration.normal * 1000 +
  AI_CHAT_SCROLL_PIN_ANIMATION_TAIL_MARGIN_IN_MS;
