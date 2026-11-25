import { ListItemButton } from 'twenty-ui/components/navigation';
import { Avatar } from 'twenty-ui/primitives/data-display';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getAvatarShape } from '@/object-metadata/utils/getAvatarShape';
import { useSidePanelListItemFocus } from '@/side-panel/hooks/useSidePanelListItemFocus';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type SidePanelLinkAiChatToRecordsItemProps = {
  recordId: string;
  objectNameSingular: string;
  objectLabelSingular: string;
  label: string;
  imageUrl?: string | null;
  isLinked: boolean;
  onToggle: () => void;
};

export const SidePanelLinkAiChatToRecordsItem = ({
  recordId,
  objectNameSingular,
  objectLabelSingular,
  label,
  imageUrl,
  isLinked,
  onToggle,
}: SidePanelLinkAiChatToRecordsItemProps) => {
  const { objectMetadataItems } = useObjectMetadataItems();
  const { nativeItemRef, isSelectedItemId, handleFocus } =
    useSidePanelListItemFocus(recordId);

  return (
    <ListItemButton
      ref={nativeItemRef}
      indicator="checkbox"
      selected={isLinked}
      focused={isSelectedItemId}
      startIcon={
        <Avatar
          shape={getAvatarShape(
            objectMetadataItems.find(
              ({ nameSingular }) => nameSingular === objectNameSingular,
            ),
          )}
          src={getAbsoluteImageUrl(imageUrl)}
          colorSeed={recordId}
          name={label}
        />
      }
      description={objectLabelSingular}
      aria-pressed={isLinked}
      onClick={onToggle}
      onFocus={handleFocus}
    >
      {label}
    </ListItemButton>
  );
};
