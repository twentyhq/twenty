import { CommandMenuContextChipGroups } from '@/command-menu/components/CommandMenuContextChipGroups';
import { CommandMenuContextRecordChipAvatars } from '@/command-menu/components/CommandMenuContextRecordChipAvatars';
import { getSelectedRecordsContextText } from '@/command-menu/utils/getRecordContextText';
import { useFindManyRecordsSelectedInContextStore } from '@/context-store/hooks/useFindManyRecordsSelectedInContextStore';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { CommandMenuContextChipProps } from './CommandMenuContextChip';

export const CommandMenuContextChipGroupsWithRecordSelection = ({
  contextChips,
  objectMetadataItemId,
}: {
  contextChips: CommandMenuContextChipProps[];
  objectMetadataItemId: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataItemId,
  });

  const { records, loading, totalCount } =
    useFindManyRecordsSelectedInContextStore({
      limit: 3,
    });

  if (loading || !totalCount) {
    return null;
  }

  const Avatars = records.map((record) => (
    <CommandMenuContextRecordChipAvatars
      objectMetadataItem={objectMetadataItem}
      key={record.id}
      record={record}
    />
  ));

  const selectedRecordsContextText = getSelectedRecordsContextText(
    objectMetadataItem,
    records,
    totalCount,
  );

  return (
    <CommandMenuContextChipGroups
      contextChips={[
        {
          text: selectedRecordsContextText,
          Icons: Avatars,
        },
        ...contextChips,
      ]}
    />
  );
};
