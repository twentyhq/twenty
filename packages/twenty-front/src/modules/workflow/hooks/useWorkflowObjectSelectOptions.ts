import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectMetadataSelectHelpers } from '@/object-metadata/hooks/useObjectMetadataSelectHelpers';
import { type SelectOption } from 'twenty-ui/primitives/input';

export const useWorkflowObjectSelectOptions = (): SelectOption<string>[] => {
  const { objectMetadataItems } = useFilteredObjectMetadataItems();
  const { getSelectIconPropsFromObjectMetadataItem } =
    useObjectMetadataSelectHelpers();

  const activeObjectMetadataItems = objectMetadataItems.filter(
    (objectMetadataItem) => objectMetadataItem.isActive,
  );

  return [
    ...activeObjectMetadataItems.filter(
      (objectMetadataItem) => !objectMetadataItem.isSystem,
    ),
    ...activeObjectMetadataItems.filter(
      (objectMetadataItem) => objectMetadataItem.isSystem,
    ),
  ].map((objectMetadataItem) => ({
    label: objectMetadataItem.labelPlural,
    value: objectMetadataItem.nameSingular,
    searchKeywords: `${objectMetadataItem.nameSingular} ${objectMetadataItem.labelSingular}`,
    ...getSelectIconPropsFromObjectMetadataItem(objectMetadataItem),
  }));
};
