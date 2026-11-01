import { type LogsSwitchTypingFrame } from '@/navigation/types/LogsSwitchTypingFrame';

export type LogsSwitchTypingSequence = {
  direction: 'enter' | 'exit';
  frames: LogsSwitchTypingFrame[];
  index: number;
};
