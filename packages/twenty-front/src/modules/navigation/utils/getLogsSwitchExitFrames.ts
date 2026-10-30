import { LOGS_SWITCH_TYPING_DELAYS_IN_MS } from '@/navigation/constants/LogsSwitchTypingDelaysInMs';
import { type LogsSwitchTypingFrame } from '@/navigation/types/LogsSwitchTypingFrame';

export const getLogsSwitchExitFrames = (
  label: string,
): LogsSwitchTypingFrame[] =>
  Array.from({ length: label.length + 1 }, (_, index) => ({
    text: label,
    codeFontStart: index,
    codeFontEnd: label.length,
    delayAfterMs: LOGS_SWITCH_TYPING_DELAYS_IN_MS.codeFontSweepLetter,
  }));
