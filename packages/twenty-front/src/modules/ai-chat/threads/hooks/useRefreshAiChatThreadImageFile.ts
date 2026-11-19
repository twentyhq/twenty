import gql from 'graphql-tag';
import { useStore } from 'jotai';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useApplyAiChatThreadUpdate } from '@/ai-chat/threads/hooks/useApplyAiChatThreadUpdate';
import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { objectPermissionsByObjectMetadataIdSelector } from '@/object-metadata/states/objectPermissionsByObjectMetadataIdSelector';

export const useRefreshAiChatThreadImageFile = () => {
  const apolloCoreClient = useApolloCoreClient();
  const store = useStore();
  const { applyAiChatThreadUpdate } = useApplyAiChatThreadUpdate();

  const refreshAiChatThreadImageFile = async (threadId: string) => {
    const objectMetadataItems = store.get(objectMetadataItemsSelector.atom);
    const objectMetadataItem = objectMetadataItems.find(
      ({ nameSingular }) =>
        nameSingular === StandardObjectNameSingular.AgentChatThread,
    );

    if (!isDefined(objectMetadataItem)) {
      return;
    }

    const { data } = await apolloCoreClient.query<
      Record<string, RecordGqlNode | null>
    >({
      query: gql`
        query FindOneAgentChatThreadImageFile($objectRecordId: UUID!) {
          agentChatThread(filter: { id: { eq: $objectRecordId } })${mapObjectMetadataToGraphQLQuery(
            {
              objectMetadataItems,
              objectMetadataItem,
              recordGqlFields: { id: true, imageFile: true },
              objectPermissionsByObjectMetadataId: store.get(
                objectPermissionsByObjectMetadataIdSelector.atom,
              ),
            },
          )}
        }
      `,
      variables: { objectRecordId: threadId },
      fetchPolicy: 'network-only',
    });
    const recordNode = data?.agentChatThread;

    if (!isDefined(recordNode)) {
      return;
    }

    const { id, imageFile } = getRecordFromRecordNode<AiChatThreadRecord>({
      recordNode,
    });

    applyAiChatThreadUpdate({ id, imageFile });
  };

  return { refreshAiChatThreadImageFile };
};
