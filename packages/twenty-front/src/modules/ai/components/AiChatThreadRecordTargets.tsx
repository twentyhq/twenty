import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AiChatThreadRecordTargetsContent } from '@/ai/components/AiChatThreadRecordTargetsContent';
import { AGENT_CHAT_THREAD_OBJECT_NAME_SINGULAR } from '@/ai/constants/AgentChatThreadObjectNameSingular';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getObjectMorphJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getObjectMorphJunctionConfig';
import { isUsableJunctionConfig } from '@/object-record/record-field/ui/utils/junction/isUsableJunctionConfig';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

type AiChatThreadRecordTargetsProps = {
  threadId: string;
  instanceId: string;
};

export const AiChatThreadRecordTargets = ({
  threadId,
  instanceId,
}: AiChatThreadRecordTargetsProps) => {
  const isConversationsTabEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CONVERSATIONS_TAB_ENABLED,
  );
  const { objectMetadataItems } = useObjectMetadataItems();

  // The thread query is built from this config, so it has to keep its
  // identity across renders or the query would be rebuilt each time.
  const junctionConfig = useMemo(() => {
    const threadObjectMetadataItem = objectMetadataItems.find(
      ({ nameSingular }) =>
        nameSingular === AGENT_CHAT_THREAD_OBJECT_NAME_SINGULAR,
    );

    return isDefined(threadObjectMetadataItem)
      ? getObjectMorphJunctionConfig({
          objectMetadata: threadObjectMetadataItem,
          objectMetadataItems,
        })
      : null;
  }, [objectMetadataItems]);

  if (!isConversationsTabEnabled || !isUsableJunctionConfig(junctionConfig)) {
    return null;
  }

  return (
    <AiChatThreadRecordTargetsContent
      threadId={threadId}
      instanceId={instanceId}
      junctionConfig={junctionConfig}
    />
  );
};
