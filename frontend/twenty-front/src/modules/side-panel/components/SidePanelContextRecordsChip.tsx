import { SidePanelContextChip } from '@/side-panel/components/SidePanelContextChip';
import { SidePanelContextRecordChipAvatars } from '@/side-panel/components/SidePanelContextRecordChipAvatars';
import { getSelectedRecordsContextText } from '@/side-panel/utils/getSelectedRecordsContextText';
import { useFindManyRecordsSelectedInContextStore } from '@/context-store/hooks/useFindManyRecordsSelectedInContextStore';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { allowRequestsToTwentyIconsState } from '@/client-config/states/allowRequestsToTwentyIcons';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const SidePanelContextRecordsChip = ({
  objectMetadataItemId,
  instanceId,
}: {
  objectMetadataItemId: string;
  instanceId?: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataItemId,
  });
  const allowRequestsToTwentyIcons = useAtomStateValue(
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
    <SidePanelContextRecordChipAvatars
      objectMetadataItem={objectMetadataItem}
      key={record.id}
      record={record}
    />
  ));

  return (
    <SidePanelContextChip
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
