import { type FlatViewGroup } from '@/metadata-store/types/FlatViewGroup';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { VIEW_GROUP_VISIBLE_OPTIONS_MAX } from 'twenty-shared/constants';
import { v4 } from 'uuid';

// Mirrors the server's computeFlatViewGroupsOnViewCreate so the draft preview matches what save generates.
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
