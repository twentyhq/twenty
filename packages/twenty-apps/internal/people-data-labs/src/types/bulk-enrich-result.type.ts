import { type EnrichResult } from 'src/types/enrich-result.type';

export type BulkEnrichResult = {
  success: boolean;
  total: number;
  matched: number;
  notFound: number;
  skipped: number;
  errored: number;
  results: EnrichResult[];
};
