import { CommandMenuContextChip } from '@/command-menu/components/CommandMenuContextChip';
import { CommandMenuContextRecordChipAvatars } from '@/command-menu/components/CommandMenuContextRecordChipAvatars';
import { getSelectedRecordsContextText } from '@/command-menu/utils/getRecordContextText';
import { useFindManyRecordsSelectedInContextStore } from '@/context-store/hooks/useFindManyRecordsSelectedInContextStore';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { allowRequestsToTwentyIconsState } from '@/client-config/states/allowRequestsToTwentyIcons';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

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
  const allowRequestsToTwentyIcons = useRecoilValueV2(
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
