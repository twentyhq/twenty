import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

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
  // Missing or SYSTEM metadata has not passed the compatibility backfill yet.
  return (
    (!isDefined(thread) || thread.readability === MetadataReadability.SYSTEM) &&
    !wasRecordSharingEnabled
  );
};
