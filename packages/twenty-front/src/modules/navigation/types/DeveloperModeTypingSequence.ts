import { type DeveloperModeTypingFrame } from '@/navigation/types/DeveloperModeTypingFrame';

export type DeveloperModeTypingSequence = {
  direction: 'enter' | 'exit';
  frames: DeveloperModeTypingFrame[];
  index: number;
};
