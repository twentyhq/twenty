import { useNonSystemActiveObjectMetadataItems } from '@/object-metadata/hooks/useNonSystemActiveObjectMetadataItems';
import { useGoToHotkeys } from '@/ui/utilities/hotkey/hooks/useGoToHotkeys';

const SingleHotkeyHookEffect = (props: {
  hotkey: string;
  pathToNavigateTo: string;
}) => {
  const { hotkey, pathToNavigateTo } = props;
  useGoToHotkeys(hotkey, pathToNavigateTo);
  return <></>;
};

export const GotoHotkeys = () => {
  const { nonSystemActiveObjectMetadataItems } =
    useNonSystemActiveObjectMetadataItems();

  useGoToHotkeys('s', '/settings/profile');

  return nonSystemActiveObjectMetadataItems.map((objectMetadataItem) => (
    <SingleHotkeyHookEffect
      hotkey={objectMetadataItem.namePlural[0]}
      pathToNavigateTo={`/objects/${objectMetadataItem.namePlural}`}
    />
  ));
};
