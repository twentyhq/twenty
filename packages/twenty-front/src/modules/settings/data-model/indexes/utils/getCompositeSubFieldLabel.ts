import { COMPOSITE_SUB_FIELD_LABELS } from '@/settings/data-model/indexes/constants/CompositeSubFieldLabels';
import { type FieldMetadataType } from '~/generated-metadata/graphql';

export const getCompositeSubFieldLabel = (
  parentType: FieldMetadataType,
  subFieldName: string,
): string =>
  COMPOSITE_SUB_FIELD_LABELS[parentType]?.[subFieldName] ?? subFieldName;
