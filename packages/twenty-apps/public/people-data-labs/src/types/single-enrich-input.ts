import { type UpdateFieldsOption } from 'src/types/update-fields-option';

export type SingleEnrichInput = {
  recordId?: string;
  updateFields?: UpdateFieldsOption;
  requiredFields?: string[];
  minLikelihood?: number;
  weakIdentifierMinLikelihood?: number;
};
