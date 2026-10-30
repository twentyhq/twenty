import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

export type LinkedinHistoryImportChunkResult = {
  importedConversationCount: number;
  error?: LinkedinHistoryImportState['error'];
};
