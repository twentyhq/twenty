import { type UpdateFieldsOption } from 'src/constants/update-fields-options';

export type RecordInput = string | { id?: string | null };

export type BulkEnrichInput = {
  records: RecordInput | RecordInput[];
  updateFields?: UpdateFieldsOption;
  minLikelihood?: number;
};
