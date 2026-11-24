import { type SidePanelSearchAiAnswer } from '@/side-panel/pages/search/types/SidePanelSearchAiAnswer';

export type SidePanelSearchAiAnswerResponse =
  | SidePanelSearchAiAnswer
  | { kind: 'limited' };
