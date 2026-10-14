import { type DeveloperModeTypingFrame } from '@/navigation/types/DeveloperModeTypingFrame';

export const getDeveloperModeCodeFontFrame = ({
  text,
  delayAfterMs,
}: {
  text: string;
  delayAfterMs: number;
}): DeveloperModeTypingFrame => ({
  text,
  codeFontStart: 0,
  codeFontEnd: text.length,
  delayAfterMs,
});
