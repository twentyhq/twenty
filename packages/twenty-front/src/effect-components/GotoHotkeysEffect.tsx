import { useNonSystemActiveObjectMetadataItems } from '@/object-metadata/hooks/useNonSystemActiveObjectMetadataItems';
import { useGoToHotkeys } from '@/ui/utilities/hotkey/hooks/useGoToHotkeys';

export const GotoHotkeysEffect = () => {
  const { nonSystemActiveObjectMetadataItems } =
    useNonSystemActiveObjectMetadataItems();

  console.log(nonSystemActiveObjectMetadataItems);

  nonSystemActiveObjectMetadataItems.forEach((objectMetadataItem) => {
    useGoToHotkeys(
      objectMetadataItem.namePlural[0],
      `/objects/${objectMetadataItem.namePlural}`,
    );
  });

  useGoToHotkeys('s', '/settings/profile');

  return <></>;
};
