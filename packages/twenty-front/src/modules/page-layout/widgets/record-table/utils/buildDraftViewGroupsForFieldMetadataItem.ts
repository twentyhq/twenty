import { type FlatViewGroup } from '@/metadata-store/types/FlatViewGroup';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { VIEW_GROUP_VISIBLE_OPTIONS_MAX } from 'twenty-shared/constants';
import { v4 } from 'uuid';

// Mirrors the server-side computeFlatViewGroupsOnViewCreate so the edit-mode draft
// preview matches what the server generates on save: one group per select option (in
// option order), none for relations since their groups are picked by the user, plus
// an empty group for nullable fields.
export const buildDraftViewGroupsForFieldMetadataItem = ({
  viewId,
  fieldMetadataItem,
}: {
  viewId: string;
  fieldMetadataItem: FieldMetadataItem;
}): FlatViewGroup[] => {
  const selectOptions = isManyToOneRelationField(fieldMetadataItem)
    ? []
    : (fieldMetadataItem.options ?? []);

  const viewGroupsFromOptions: FlatViewGroup[] = selectOptions.map(
    (option, index) => ({
      id: v4(),
      viewId,
      fieldValue: option.value,
      position: index,
      isVisible: index < VIEW_GROUP_VISIBLE_OPTIONS_MAX,
    }),
  );

  if (fieldMetadataItem.isNullable !== true) {
    return viewGroupsFromOptions;
  }

  const emptyViewGroupPosition = viewGroupsFromOptions.length;

  return [
    ...viewGroupsFromOptions,
    {
      id: v4(),
      viewId,
      fieldValue: '',
      position: emptyViewGroupPosition,
      isVisible: emptyViewGroupPosition < VIEW_GROUP_VISIBLE_OPTIONS_MAX,
    },
  ];
};
