import { type UpdateFieldsOption } from 'src/constants/update-fields-options';

export type SingleEnrichInput = {
  recordId?: string;
  updateFields?: UpdateFieldsOption;
  minLikelihood?: number;
};
