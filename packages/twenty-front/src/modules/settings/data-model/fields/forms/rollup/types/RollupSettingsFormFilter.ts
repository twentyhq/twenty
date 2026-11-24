import { type ViewFilterOperand } from 'twenty-shared/types';

export type RollupSettingsFormFilter = {
  id: string;
  fieldMetadataId: string;
  operand: ViewFilterOperand;
  value: string;
};
