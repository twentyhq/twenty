import { SuggestionRow } from '@/ui/suggestion/components/SuggestionRow';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getAvatarShape } from '@/object-metadata/utils/getAvatarShape';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type MentionMenuListItemProps = {
  recordId: string;
  objectNameSingular: string;
  label: string;
  imageUrl: string;
  objectLabelSingular: string;
  isSelected: boolean;
  onClick: () => void;
};

export const MentionMenuListItem = ({
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
    <SuggestionRow
      selected={isSelected}
      onSelect={onClick}
      startIcon={
        <Avatar
          name={label}
          colorSeed={recordId}
          src={getAbsoluteImageUrl(imageUrl)}
          shape={getAvatarShape(objectMetadataItem)}
          size="sm"
        />
      }
      description={objectLabelSingular}
    >
      {label}
    </SuggestionRow>
  );
};
