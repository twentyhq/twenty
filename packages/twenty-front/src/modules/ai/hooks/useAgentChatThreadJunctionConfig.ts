import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_THREAD_OBJECT_NAME_SINGULAR } from '@/ai/constants/AgentChatThreadObjectNameSingular';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getObjectMorphJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getObjectMorphJunctionConfig';
import { isUsableJunctionConfig } from '@/object-record/record-field/ui/utils/junction/isUsableJunctionConfig';

export const useAgentChatThreadJunctionConfig = () => {
  const { objectMetadataItems } = useObjectMetadataItems();

  // Record queries are built from this config, so it has to keep its identity
  // across renders or they would be rebuilt each time.
  return useMemo(() => {
    const threadObjectMetadataItem = objectMetadataItems.find(
      ({ nameSingular }) =>
        nameSingular === AGENT_CHAT_THREAD_OBJECT_NAME_SINGULAR,
    );

    if (!isDefined(threadObjectMetadataItem)) {
      return null;
    }

    const junctionConfig = getObjectMorphJunctionConfig({
      objectMetadata: threadObjectMetadataItem,
      objectMetadataItems,
    });

    return isUsableJunctionConfig(junctionConfig) ? junctionConfig : null;
  }, [objectMetadataItems]);
};
