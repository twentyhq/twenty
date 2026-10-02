import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectMetadataSelectHelpers } from '@/object-metadata/hooks/useObjectMetadataSelectHelpers';
import { type SelectOption } from 'twenty-ui/primitives/input';

type UseWorkflowObjectSelectOptionsProps = {
  selectedObjectNameSingular?: string;
};

export const useWorkflowObjectSelectOptions = ({
  selectedObjectNameSingular,
}: UseWorkflowObjectSelectOptionsProps = {}): SelectOption<string>[] => {
  const { objectMetadataItems } = useFilteredObjectMetadataItems();
  const { getSelectIconPropsFromObjectMetadataItem } =
    useObjectMetadataSelectHelpers();

  const selectableObjectMetadataItems = objectMetadataItems.filter(
    (objectMetadataItem) =>
      objectMetadataItem.isActive ||
      objectMetadataItem.nameSingular === selectedObjectNameSingular,
  );

  return [
    ...selectableObjectMetadataItems.filter(
      (objectMetadataItem) => !objectMetadataItem.isSystem,
    ),
    ...selectableObjectMetadataItems.filter(
      (objectMetadataItem) => objectMetadataItem.isSystem,
    ),
  ].map((objectMetadataItem) => ({
    label: objectMetadataItem.labelPlural,
    value: objectMetadataItem.nameSingular,
    searchKeywords: `${objectMetadataItem.nameSingular} ${objectMetadataItem.labelSingular}`,
    ...getSelectIconPropsFromObjectMetadataItem(objectMetadataItem),
  }));
};
