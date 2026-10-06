import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getFilterFilterableFieldMetadataItems } from '@/object-metadata/utils/getFilterFilterableFieldMetadataItems';
import {
  DASHBOARD_FILTER_SLOT_FILTER_TYPES,
  type DashboardFilterSlotFilterType,
} from 'twenty-shared/types';
import { getFilterTypeFromFieldType } from 'twenty-shared/utils';

// JSON fields never map to a slot type, so the flag that gates them is irrelevant here.
const isFieldFilterable = getFilterFilterableFieldMetadataItems({
  isJsonFilterEnabled: false,
});

export const getDashboardFilterSlotFilterTypeForField = (
  field: Pick<FieldMetadataItem, 'type'>,
): DashboardFilterSlotFilterType | null => {
  const filterType = getFilterTypeFromFieldType(field.type);

  return (DASHBOARD_FILTER_SLOT_FILTER_TYPES as readonly string[]).includes(
    filterType,
  )
    ? (filterType as DashboardFilterSlotFilterType)
    : null;
};

// A field can back a slot when the regular filter UI can filter on it and its filter type is one a slot can carry.
export const isDashboardFilterCandidateField = (
  field: FieldMetadataItem,
): boolean =>
  isFieldFilterable(field) === true &&
  getDashboardFilterSlotFilterTypeForField(field) !== null;
