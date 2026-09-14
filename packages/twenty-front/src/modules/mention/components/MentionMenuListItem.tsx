import { type MouseEvent } from 'react';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getAvatarShape } from '@/object-metadata/utils/getAvatarShape';
import { Avatar } from 'twenty-ui/data-display';
import { MenuItemSuggestion } from 'twenty-ui/navigation';
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

  const handleClick = (event?: MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    onClick();
  };

  return (
    <MenuItemSuggestion
      selected={isSelected}
      onClick={handleClick}
      text={label}
      contextualText={objectLabelSingular}
      contextualTextPosition="left"
      LeftIcon={() => (
        <Avatar
          name={label}
          colorSeed={recordId}
          src={getAbsoluteImageUrl(imageUrl)}
          shape={getAvatarShape(objectMetadataItem)}
          size="sm"
        />
      )}
    />
  );
};
