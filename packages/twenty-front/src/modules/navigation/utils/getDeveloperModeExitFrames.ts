import { DEVELOPER_MODE_TYPING_DELAYS_IN_MS } from '@/navigation/constants/DeveloperModeTypingDelaysInMs';
import { type DeveloperModeTypingFrame } from '@/navigation/types/DeveloperModeTypingFrame';

export const getDeveloperModeExitFrames = (
  label: string,
): DeveloperModeTypingFrame[] =>
  Array.from({ length: label.length + 1 }, (_, index) => ({
    text: label,
    codeFontStart: index,
    codeFontEnd: label.length,
    delayAfterMs: DEVELOPER_MODE_TYPING_DELAYS_IN_MS.codeFontSweepLetter,
  }));
