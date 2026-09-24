import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability } from 'twenty-shared/types';
import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

export const isLegacyRecordAccessOpen = ({
  flatObjectMetadataMaps,
  featureFlagsMap,
  billingEntitlements,
}: Pick<
  WorkspaceInternalContext,
  'flatObjectMetadataMaps' | 'featureFlagsMap' | 'billingEntitlements'
>): boolean => {
  const thread =
    flatObjectMetadataMaps.byUniversalIdentifier[
      STANDARD_OBJECTS.agentChatThread.universalIdentifier
    ];
  // SYSTEM is retained until compatibility grants commit. Historical entitlement
  // only distinguishes the old policy during this transition; it grants no new feature.
  return (
    thread?.readability === MetadataReadability.SYSTEM &&
    !(
      featureFlagsMap?.IS_RECORD_SHARING_ENABLED === true &&
      billingEntitlements?.RECORD_SHARING === true
    )
  );
};
