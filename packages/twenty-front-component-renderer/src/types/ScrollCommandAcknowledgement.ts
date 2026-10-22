import { type ScrolledElementPosition } from '@/types/ScrolledElementPosition';

export type ScrollCommandAcknowledgement = {
  scrollCommandSequence: number;
  scrollPositions: ScrolledElementPosition[];
};
