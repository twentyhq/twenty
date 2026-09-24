import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability } from 'twenty-shared/types';
import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

export const isLegacyRecordAccessOpen = ({
  flatObjectMetadataMaps,
  wasRecordSharingEnabled,
}: Pick<WorkspaceInternalContext, 'flatObjectMetadataMaps'> & {
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
