import { type WhatsappHistoryImportState } from 'src/types/whatsapp-history-import-state.type';

export type WhatsappHistoryImportPlanning = {
  chatIds?: string[];
  planJobId?: string;
  resumeAt?: string;
  error?: WhatsappHistoryImportState['error'];
};
