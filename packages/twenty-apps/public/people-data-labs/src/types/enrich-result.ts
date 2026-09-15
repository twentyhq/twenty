import { type EnrichStatus } from 'src/types/enrich-status';

export type EnrichResult = {
  success: boolean;
  recordId: string;
  status: EnrichStatus;
  updatedFields: string[];
  data?: Record<string, unknown>;
  message: string;
  error?: string;
};
