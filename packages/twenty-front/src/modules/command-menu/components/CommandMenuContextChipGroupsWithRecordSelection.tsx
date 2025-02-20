import { CommandMenuContextChipGroups } from '@/command-menu/components/CommandMenuContextChipGroups';
import { CommandMenuContextRecordChipAvatars } from '@/command-menu/components/CommandMenuContextRecordChipAvatars';
import { getSelectedRecordsContextText } from '@/command-menu/utils/getRecordContextText';
import { useFindManyRecordsSelectedInContextStore } from '@/context-store/hooks/useFindManyRecordsSelectedInContextStore';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { isDefined } from 'twenty-shared';
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

  if (loading) {
    return null;
  }

  const Avatars = records.map((record) => (
    <CommandMenuContextRecordChipAvatars
      objectMetadataItem={objectMetadataItem}
      key={record.id}
      record={record}
    />
  ));

  const recordSelectionContextChip =
    totalCount && records.length > 0
      ? {
          text: getSelectedRecordsContextText(
            objectMetadataItem,
            records,
            totalCount,
          ),
          Icons: Avatars,
        }
      : undefined;

  const contextChipsWithRecordSelection = [
    recordSelectionContextChip,
    ...contextChips,
  ].filter(isDefined);

  return (
    <CommandMenuContextChipGroups
      contextChips={contextChipsWithRecordSelection}
    />
  );
};
