import { type ToolRecordReference } from 'twenty-shared/ai';

export type SidePanelSearchAiAnswer =
  | { kind: 'answer'; text: string; sources: ToolRecordReference[] }
  | { kind: 'handoff' };
