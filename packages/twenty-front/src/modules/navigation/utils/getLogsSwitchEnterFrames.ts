import { LOGS_SWITCH_TYPING_DELAYS_IN_MS } from '@/navigation/constants/LogsSwitchTypingDelaysInMs';
import { type LogsSwitchTypingFrame } from '@/navigation/types/LogsSwitchTypingFrame';
import { getLogsSwitchCodeFontFrame } from '@/navigation/utils/getLogsSwitchCodeFontFrame';

const getCodeFontSweepFrames = (text: string): LogsSwitchTypingFrame[] =>
  Array.from({ length: text.length }, (_, index) => ({
    text,
    codeFontStart: 0,
    codeFontEnd: index + 1,
    delayAfterMs: LOGS_SWITCH_TYPING_DELAYS_IN_MS.codeFontSweepLetter,
  }));

const getTypedFrames = (text: string) =>
  Array.from({ length: text.length }, (_, index) =>
    getLogsSwitchCodeFontFrame({
      text: text.slice(0, index + 1),
      delayAfterMs: LOGS_SWITCH_TYPING_DELAYS_IN_MS.typedLetter,
    }),
  );

const getErasedFrames = (text: string) =>
  Array.from({ length: text.length }, (_, index) =>
    getLogsSwitchCodeFontFrame({
      text: text.slice(0, text.length - index - 1),
      delayAfterMs: LOGS_SWITCH_TYPING_DELAYS_IN_MS.erasedLetter,
    }),
  );

const holdLastFrame = ({
  frames,
  holdMs,
}: {
  frames: LogsSwitchTypingFrame[];
  holdMs: number;
}): LogsSwitchTypingFrame[] =>
  frames.map((frame, index) =>
    index === frames.length - 1 ? { ...frame, delayAfterMs: holdMs } : frame,
  );

export const getLogsSwitchEnterFrames = ({
  label,
  phrase,
}: {
  label: string;
  phrase: string;
}): LogsSwitchTypingFrame[] => [
  ...holdLastFrame({
    frames: getCodeFontSweepFrames(label),
    holdMs: LOGS_SWITCH_TYPING_DELAYS_IN_MS.codeFontSweepHold,
  }),
  ...holdLastFrame({
    frames: getErasedFrames(label),
    holdMs: LOGS_SWITCH_TYPING_DELAYS_IN_MS.erasedHold,
  }),
  ...holdLastFrame({
    frames: getTypedFrames(phrase),
    holdMs: LOGS_SWITCH_TYPING_DELAYS_IN_MS.phraseHold,
  }),
  ...holdLastFrame({
    frames: getErasedFrames(phrase),
    holdMs: LOGS_SWITCH_TYPING_DELAYS_IN_MS.erasedHold,
  }),
  ...getTypedFrames(label),
];
