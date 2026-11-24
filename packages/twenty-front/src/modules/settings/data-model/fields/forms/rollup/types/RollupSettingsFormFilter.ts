import { type ViewFilterOperand } from 'twenty-shared/types';

export type RollupSettingsFormFilter = {
  id: string;
  fieldMetadataId: string;
  operand: ViewFilterOperand;
  value: string | string[] | boolean | number | Record<string, unknown>;
  subFieldName?: string;
  relationTargetFieldMetadataId?: string;
  filterGroupId?: string;
};
