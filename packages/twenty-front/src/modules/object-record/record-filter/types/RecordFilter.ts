import { type FILTER_OPERANDS_MAP } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { type CompositeFieldSubFieldName } from '@/settings/data-model/types/CompositeFieldSubFieldName';
import {
  type FieldMetadataType,
  type FilterableAndTSVectorFieldType,
  type ViewFilterOperand,
} from 'twenty-shared/types';

// RLS-specific: references a workspace member field for dynamic "Me" comparisons
export type RLSDynamicValue = {
  workspaceMemberFieldMetadataId: string;
  workspaceMemberSubFieldName?: string | null;
};

export type RecordFilter = {
  id: string;
  fieldMetadataId: string;
  value: string;
  /** @deprecated We shouldn't implement new features with this field and instead try to create utils to obtain the displayValue at runtime */
  displayValue: string;
  type: FilterableAndTSVectorFieldType;
  recordFilterGroupId?: string;
  displayAvatarUrl?: string;
  operand: ViewFilterOperand;
  positionInRecordFilterGroup?: number | null;
  label: string;
  subFieldName?: CompositeFieldSubFieldName | null | undefined;
  // Resolved at filter construction time (frontend mapping or chip edit) so
  // the GraphQL builder doesn't need a cross-object field lookup. Null for
  // non-relation filters; also null when the target field can no longer be
  // resolved (e.g. it was deleted).
  relationTargetField?: {
    id: string;
    name: string;
    type: FieldMetadataType;
    label: string;
  } | null;
  rlsDynamicValue?: RLSDynamicValue | null;
};

export type RecordFilterToRecordInputOperand<
  T extends FilterableAndTSVectorFieldType,
> = (typeof FILTER_OPERANDS_MAP)[T][number];
