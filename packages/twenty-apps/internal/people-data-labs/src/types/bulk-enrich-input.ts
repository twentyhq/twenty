export type BulkEnrichInput = {
  records: Array<string | { id?: string | null }>;
  force?: boolean;
  minLikelihood?: number;
};
