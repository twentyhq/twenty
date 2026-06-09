export type RecordInput = string | { id?: string | null };

export type BulkEnrichInput = {
  records: RecordInput | RecordInput[];
  force?: boolean;
  minLikelihood?: number;
};
