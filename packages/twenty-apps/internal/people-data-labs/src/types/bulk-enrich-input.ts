export type RecordInput = string | { id?: string | null };

export type BulkEnrichInput = {
  records: RecordInput | RecordInput[];
  overrideExistingValues?: boolean;
  minLikelihood?: number;
};
