import { GoToHotkeyItemEffect } from '@/app/effect-components/GoToHotkeyItemEffect';
import { useNonSystemActiveObjectMetadataItems } from '@/object-metadata/hooks/useNonSystemActiveObjectMetadataItems';
import { useGoToHotkeys } from '@/ui/utilities/hotkey/hooks/useGoToHotkeys';

export const GotoHotkeys = () => {
  const { nonSystemActiveObjectMetadataItems } =
    useNonSystemActiveObjectMetadataItems();

  // Hardcoded since settings is static
  useGoToHotkeys('s', '/settings/profile');

  return nonSystemActiveObjectMetadataItems.map((objectMetadataItem) => (
    <GoToHotkeyItemEffect
      hotkey={objectMetadataItem.namePlural[0]}
      pathToNavigateTo={`/objects/${objectMetadataItem.namePlural}`}
    />
  ));
};
