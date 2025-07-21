import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { CommandMenuContextRecordChipAvatars } from '@/command-menu/components/CommandMenuContextRecordChipAvatars';
import { getSelectedRecordsContextText } from '@/command-menu/utils/getRecordContextText';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { MultipleAvatarChip } from 'twenty-ui/components';

export const AgentChatMultipleRecordPreview = ({
  objectMetadataItem,
  records,
  totalCount,
}: {
  objectMetadataItem: ObjectMetadataItem;
  records: ObjectRecord[];
  totalCount: number;
}) => {
  const Avatars = records.map((record) => (
    // @todo move this components to be less specific. (Outside of CommandMenu
    <CommandMenuContextRecordChipAvatars
      objectMetadataItem={objectMetadataItem}
      key={record.id}
      record={record}
    />
  ));

  const recordSelectionContextChip = {
    // @todo move this utils outside of CommandMenu
    text: getSelectedRecordsContextText(
      objectMetadataItem,
      records,
      totalCount,
    ),
    Icons: Avatars,
    withIconBackground: false,
  };

  return (
    <MultipleAvatarChip
      Icons={recordSelectionContextChip.Icons}
      text={recordSelectionContextChip.text}
      maxWidth={180}
    />
  );
};
