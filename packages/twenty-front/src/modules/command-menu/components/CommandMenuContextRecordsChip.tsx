import { CommandMenuContextChip } from '@/command-menu/components/CommandMenuContextChip';
import { CommandMenuContextRecordChipAvatars } from '@/command-menu/components/CommandMenuContextRecordChipAvatars';
import { getSelectedRecordsContextText } from '@/command-menu/utils/getRecordContextText';
import { useFindManyRecordsSelectedInContextStore } from '@/context-store/hooks/useFindManyRecordsSelectedInContextStore';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { allowRequestsToTwentyIconsState } from '@/client-config/states/allowRequestsToTwentyIcons';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';

export const CommandMenuContextRecordsChip = ({
  objectMetadataItemId,
  instanceId,
}: {
  objectMetadataItemId: string;
  instanceId?: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataItemId,
  });
  const allowRequestsToTwentyIcons = useAtomValue(
    allowRequestsToTwentyIconsState,
  );

  const { records, loading, totalCount } =
    useFindManyRecordsSelectedInContextStore({
      limit: 3,
      instanceId,
    });

  if (loading || !totalCount || records.length === 0) {
    return null;
  }

  const Avatars = records.map((record) => (
    <CommandMenuContextRecordChipAvatars
      objectMetadataItem={objectMetadataItem}
      key={record.id}
      record={record}
    />
  ));

  return (
    <CommandMenuContextChip
      text={getSelectedRecordsContextText(
        objectMetadataItem,
        records,
        totalCount,
        allowRequestsToTwentyIcons,
      )}
      Icons={Avatars}
    />
  );
};
