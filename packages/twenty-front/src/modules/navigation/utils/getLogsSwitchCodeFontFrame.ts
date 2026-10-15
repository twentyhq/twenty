import { type LogsSwitchTypingFrame } from '@/navigation/types/LogsSwitchTypingFrame';

export const getLogsSwitchCodeFontFrame = ({
  text,
  delayAfterMs,
}: {
  text: string;
  delayAfterMs: number;
}): LogsSwitchTypingFrame => ({
  text,
  codeFontStart: 0,
  codeFontEnd: text.length,
  delayAfterMs,
});
