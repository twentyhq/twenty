import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability } from 'twenty-shared/types';

export const isLegacyRecordAccessOpen = ({
  flatObjectMetadataMaps,
  wasRecordSharingEnabled,
}: {
  flatObjectMetadataMaps: {
    byUniversalIdentifier: Record<
      string,
      { readability: MetadataReadability } | undefined
    >;
  };
  wasRecordSharingEnabled: boolean;
}): boolean => {
  const thread =
    flatObjectMetadataMaps.byUniversalIdentifier[
      STANDARD_OBJECTS.agentChatThread.universalIdentifier
    ];
  // SYSTEM stays in place until compatibility grants have committed.
  return (
    thread?.readability === MetadataReadability.SYSTEM &&
    !wasRecordSharingEnabled
  );
};
