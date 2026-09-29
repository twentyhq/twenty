import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components';

import { AGENT_CHAT_THREAD_OBJECT_NAME_SINGULAR } from '@/ai/constants/AgentChatThreadObjectNameSingular';
import { useAgentChatThreadJunctionConfig } from '@/ai/hooks/useAgentChatThreadJunctionConfig';
import { findAgentChatThreadTargetFieldInfo } from '@/ai/utils/findAgentChatThreadTargetFieldInfo';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { type SearchRecord } from '~/generated/graphql';

const EXISTING_LINK_GQL_FIELDS = { id: true };

export const useAttachChatThreadToRecord = () => {
  const { enqueueToast } = useToast();
  const apolloCoreClient = useApolloCoreClient();
  const { objectMetadataItems } = useObjectMetadataItems();
  const junctionConfig = useAgentChatThreadJunctionConfig();

  // Hooks cannot be conditional, so a workspace without the link object falls
  // back to the thread object, and attaching gives up before using either.
  const linkObjectNameSingular =
    junctionConfig?.junctionObjectMetadata.nameSingular ??
    AGENT_CHAT_THREAD_OBJECT_NAME_SINGULAR;

  const { findManyRecordsQuery: findExistingLinksQuery } =
    useFindManyRecordsQuery({
      objectNameSingular: linkObjectNameSingular,
      recordGqlFields: EXISTING_LINK_GQL_FIELDS,
    });
  const { createManyRecords: createLinks } = useCreateManyRecords({
    objectNameSingular: linkObjectNameSingular,
  });

  // Resolves once the link exists, whoever wrote it: the chat model may attach
  // the same record through its own tool during the same turn.
  const attachChatThreadToRecord = async ({
    threadId,
    objectNameSingular,
    recordId,
  }: Pick<SearchRecord, 'objectNameSingular' | 'recordId'> & {
    threadId: string;
  }) => {
    const targetJoinColumnName = isDefined(junctionConfig)
      ? findAgentChatThreadTargetFieldInfo({
          targetFields: junctionConfig.targetFields,
          objectNameSingular,
          objectMetadataItems,
        })?.joinColumnName
      : undefined;

    if (!isDefined(junctionConfig) || !isDefined(targetJoinColumnName)) {
      return false;
    }

    try {
      // Only the standard legs carry a unique index on the thread and the
      // record, so a link to a custom object is deduplicated by looking first.
      const { data: existingLinks, error: existingLinksError } =
        await apolloCoreClient.query<RecordGqlOperationFindManyResult>({
          query: findExistingLinksQuery,
          variables: {
            filter: {
              [junctionConfig.sourceJoinColumnName]: { eq: threadId },
              [targetJoinColumnName]: { eq: recordId },
            },
            limit: 1,
          },
          fetchPolicy: 'network-only',
        });

      if (isDefined(existingLinksError)) {
        throw existingLinksError;
      }

      const hasExistingLink =
        (existingLinks?.[junctionConfig.junctionObjectMetadata.namePlural]
          ?.edges.length ?? 0) > 0;

      if (hasExistingLink) {
        return true;
      }

      // Upserting resolves a standard leg's link written since the lookup
      // instead of failing on its unique index.
      await createLinks({
        recordsToCreate: [
          {
            [junctionConfig.sourceJoinColumnName]: threadId,
            [targetJoinColumnName]: recordId,
          },
        ],
        upsert: true,
      });

      return true;
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));

      return false;
    }
  };

  return { attachChatThreadToRecord };
};
