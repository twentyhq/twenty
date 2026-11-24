import { type SidePanelSearchAiAnswer } from '@/side-panel/pages/search/types/SidePanelSearchAiAnswer';

export type SidePanelSearchAiAnswerState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; answer: SidePanelSearchAiAnswer }
  | { status: 'failed' };
