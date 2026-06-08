import { type EnrichStatus } from 'src/types/enrich-status';

export type EnrichResult = {
  success: boolean;
  recordId: string;
  status: EnrichStatus;
  updatedFields: string[];
  message: string;
  error?: string;
};
