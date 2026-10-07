import { getFieldMetadataTypeLabel } from '@/object-record/object-filter-dropdown/utils/getFieldMetadataTypeLabel';
import { type FilterableAndTSVectorFieldType } from 'twenty-shared/types';
import { type FieldMetadataType } from '~/generated-metadata/graphql';

// Filter types are the field type literals, so the settings labels apply; TS_VECTOR has no settings entry.
export const getDashboardFilterTypeLabel = (
  filterType: FilterableAndTSVectorFieldType,
): string =>
  getFieldMetadataTypeLabel(filterType as FieldMetadataType) ?? filterType;
