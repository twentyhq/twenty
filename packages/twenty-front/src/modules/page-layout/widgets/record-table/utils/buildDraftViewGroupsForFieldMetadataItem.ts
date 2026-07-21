import { type FlatViewGroup } from '@/metadata-store/types/FlatViewGroup';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { VIEW_GROUP_VISIBLE_OPTIONS_MAX } from 'twenty-shared/constants';
import { v4 } from 'uuid';

// Mirrors the server-side computeFlatViewGroupsOnViewCreate so the edit-mode
// draft preview matches what the server generates on save: one group per
// select option (in option order) plus an empty group for nullable fields.
// Relation group-by generates no option groups.
export const buildDraftViewGroupsForFieldMetadataItem = ({
  viewId,
  fieldMetadataItem,
}: {
  viewId: string;
  fieldMetadataItem: FieldMetadataItem;
}): FlatViewGroup[] => {
  if (isManyToOneRelationField(fieldMetadataItem)) {
    return [];
  }

  const viewGroupsFromOptions: FlatViewGroup[] = (
    fieldMetadataItem.options ?? []
  ).map((option, index) => ({
    id: v4(),
    viewId,
    fieldValue: option.value,
    position: index,
    isVisible: index < VIEW_GROUP_VISIBLE_OPTIONS_MAX,
  }));

  if (fieldMetadataItem.isNullable === true) {
    viewGroupsFromOptions.push({
      id: v4(),
      viewId,
      fieldValue: '',
      position: viewGroupsFromOptions.length,
      isVisible: viewGroupsFromOptions.length < VIEW_GROUP_VISIBLE_OPTIONS_MAX,
    });
  }

  return viewGroupsFromOptions;
};
