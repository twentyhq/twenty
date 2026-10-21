import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getAvatarShape } from '@/object-metadata/utils/getAvatarShape';
import { SuggestionListItem } from '@/ui/suggestion/components/SuggestionListItem';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type MentionMenuListItemProps = {
  id: string;
  recordId: string;
  objectNameSingular: string;
  label: string;
  imageUrl: string;
  objectLabelSingular: string;
  isSelected: boolean;
  onClick: () => void;
};

export const MentionMenuListItem = ({
  id,
  recordId,
  objectNameSingular,
  label,
  imageUrl,
  objectLabelSingular,
  isSelected,
  onClick,
}: MentionMenuListItemProps) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.nameSingular === objectNameSingular,
  );

  return (
    <SuggestionListItem
      id={id}
      selected={isSelected}
      onSelect={onClick}
      description={objectLabelSingular}
      startIcon={
        <Avatar
          name={label}
          colorSeed={recordId}
          src={getAbsoluteImageUrl(imageUrl)}
          shape={getAvatarShape(objectMetadataItem)}
          size="sm"
        />
      }
    >
      {label}
    </SuggestionListItem>
  );
};
