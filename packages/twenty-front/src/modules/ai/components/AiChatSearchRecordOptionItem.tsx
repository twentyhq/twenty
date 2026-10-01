import { Dropdown, type DropdownOptionItemProps } from 'twenty-ui/components';
import { Avatar } from 'twenty-ui/primitives/data-display';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getAvatarShape } from '@/object-metadata/utils/getAvatarShape';
import { type SearchRecord } from '~/generated/graphql';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type AiChatSearchRecordOptionItemProps = Pick<
  DropdownOptionItemProps,
  'selected' | 'indicator' | 'disabled' | 'onSelect'
> & {
  searchRecord: SearchRecord;
  objectMetadataItem: EnrichedObjectMetadataItem | undefined;
};

export const AiChatSearchRecordOptionItem = ({
  searchRecord,
  objectMetadataItem,
  selected,
  indicator,
  disabled,
  onSelect,
}: AiChatSearchRecordOptionItemProps) => (
  <Dropdown.OptionItem
    selected={selected}
    indicator={indicator}
    disabled={disabled}
    startIcon={
      <Avatar
        name={searchRecord.label}
        colorSeed={searchRecord.recordId}
        src={getAbsoluteImageUrl(searchRecord.imageUrl)}
        shape={getAvatarShape(objectMetadataItem)}
        size="sm"
      />
    }
    description={searchRecord.objectLabelSingular}
    onSelect={onSelect}
  >
    {searchRecord.label}
  </Dropdown.OptionItem>
);
