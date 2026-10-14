import { DEVELOPER_MODE_TYPING_DELAYS_IN_MS } from '@/navigation/constants/DeveloperModeTypingDelaysInMs';
import { type DeveloperModeTypingFrame } from '@/navigation/types/DeveloperModeTypingFrame';
import { getDeveloperModeCodeFontFrame } from '@/navigation/utils/getDeveloperModeCodeFontFrame';

const getCodeFontSweepFrames = (text: string): DeveloperModeTypingFrame[] =>
  Array.from({ length: text.length }, (_, index) => ({
    text,
    codeFontStart: 0,
    codeFontEnd: index + 1,
    delayAfterMs: DEVELOPER_MODE_TYPING_DELAYS_IN_MS.codeFontSweepLetter,
  }));

const getTypedFrames = (text: string) =>
  Array.from({ length: text.length }, (_, index) =>
    getDeveloperModeCodeFontFrame({
      text: text.slice(0, index + 1),
      delayAfterMs: DEVELOPER_MODE_TYPING_DELAYS_IN_MS.typedLetter,
    }),
  );

const getErasedFrames = (text: string) =>
  Array.from({ length: text.length }, (_, index) =>
    getDeveloperModeCodeFontFrame({
      text: text.slice(0, text.length - index - 1),
      delayAfterMs: DEVELOPER_MODE_TYPING_DELAYS_IN_MS.erasedLetter,
    }),
  );

const holdLastFrame = ({
  frames,
  holdMs,
}: {
  frames: DeveloperModeTypingFrame[];
  holdMs: number;
}): DeveloperModeTypingFrame[] =>
  frames.map((frame, index) =>
    index === frames.length - 1 ? { ...frame, delayAfterMs: holdMs } : frame,
  );

export const getDeveloperModeEnterFrames = ({
  label,
  phrase,
}: {
  label: string;
  phrase: string;
}): DeveloperModeTypingFrame[] => [
  ...holdLastFrame({
    frames: getCodeFontSweepFrames(label),
    holdMs: DEVELOPER_MODE_TYPING_DELAYS_IN_MS.codeFontSweepHold,
  }),
  ...holdLastFrame({
    frames: getErasedFrames(label),
    holdMs: DEVELOPER_MODE_TYPING_DELAYS_IN_MS.erasedHold,
  }),
  ...holdLastFrame({
    frames: getTypedFrames(phrase),
    holdMs: DEVELOPER_MODE_TYPING_DELAYS_IN_MS.phraseHold,
  }),
  ...holdLastFrame({
    frames: getErasedFrames(phrase),
    holdMs: DEVELOPER_MODE_TYPING_DELAYS_IN_MS.erasedHold,
  }),
  ...getTypedFrames(label),
];
