import { type DeveloperModeTypingFrame } from '@/navigation/types/DeveloperModeTypingFrame';

const getTypedFrames = (text: string, delayMs: number) =>
  Array.from({ length: text.length }, (_, index) => ({
    text: text.slice(0, index + 1),
    delayAfterMs: delayMs,
  }));

const getErasedFrames = (text: string, delayMs: number) =>
  Array.from({ length: text.length }, (_, index) => ({
    text: text.slice(0, text.length - index - 1),
    delayAfterMs: delayMs,
  }));

const holdLastFrame = (
  frames: DeveloperModeTypingFrame[],
  holdMs: number,
): DeveloperModeTypingFrame[] =>
  frames.map((frame, index) =>
    index === frames.length - 1 ? { ...frame, delayAfterMs: holdMs } : frame,
  );

export const getDeveloperModeTypingFrames = ({
  greeting,
  words,
  restingWord,
}: {
  greeting: string;
  words: string[];
  restingWord: string;
}): DeveloperModeTypingFrame[] => [
  { text: '', delayAfterMs: 350 },
  ...holdLastFrame(getTypedFrames(greeting, 55), 1400),
  ...holdLastFrame(getErasedFrames(greeting, 25), 150),
  ...words.flatMap((word) => [
    ...holdLastFrame(getTypedFrames(word, 70), 1200),
    ...holdLastFrame(getErasedFrames(word, 35), 150),
  ]),
  ...getTypedFrames(restingWord, 70),
];
