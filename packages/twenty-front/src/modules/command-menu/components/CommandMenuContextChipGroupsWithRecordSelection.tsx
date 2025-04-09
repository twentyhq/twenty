import { CommandMenuContextChipGroups } from '@/command-menu/components/CommandMenuContextChipGroups';
import { CommandMenuContextRecordChipAvatars } from '@/command-menu/components/CommandMenuContextRecordChipAvatars';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { getSelectedRecordsContextText } from '@/command-menu/utils/getRecordContextText';
import { useFindManyRecordsSelectedInContextStore } from '@/context-store/hooks/useFindManyRecordsSelectedInContextStore';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { CommandMenuContextChipProps } from './CommandMenuContextChip';
import { isDefined } from 'twenty-shared/utils';

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

  const { openCommandMenu } = useCommandMenu();

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
          onClick: contextChips.length > 0 ? openCommandMenu : undefined,
          withIconBackground: false,
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
