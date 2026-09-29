import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components';

import { type AgentChatConversationTarget } from '@/ai/types/AgentChatConversationTarget';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { useObjectMorphJunctionConfig } from '@/object-record/record-field/ui/hooks/useObjectMorphJunctionConfig';
import { findTargetFieldInfo } from '@/object-record/record-field/ui/utils/junction/findTargetFieldInfo';

const EXISTING_LINK_GQL_FIELDS = { id: true };

export const useAttachChatThreadToRecord = () => {
  const { enqueueToast } = useToast();
  const apolloCoreClient = useApolloCoreClient();
  const { objectMetadataItems } = useObjectMetadataItems();
  const junctionConfig = useObjectMorphJunctionConfig({
    objectNameSingular: CoreObjectNameSingular.AgentChatThread,
  });

  const { findManyRecordsQuery: findExistingLinksQuery } =
    useFindManyRecordsQuery({
      objectNameSingular: CoreObjectNameSingular.AgentChatThreadTarget,
      recordGqlFields: EXISTING_LINK_GQL_FIELDS,
    });
  const { createManyRecords: createLinks } = useCreateManyRecords({
    objectNameSingular: CoreObjectNameSingular.AgentChatThreadTarget,
    shouldRefetchAggregateQueries: false,
  });
  const { refetchAggregateQueries } = useRefetchAggregateQueries();

  // The chat model may file the conversation under the same record through
  // its own tool during the same turn, so an existing link counts as success.
  const attachChatThreadToRecord = async ({
    threadId,
    objectNameSingular,
    recordId,
  }: AgentChatConversationTarget & { threadId: string }) => {
    const targetObjectMetadataItem = objectMetadataItems.find(
      ({ nameSingular }) => nameSingular === objectNameSingular,
    );
    const targetJoinColumnName =
      isDefined(junctionConfig) && isDefined(targetObjectMetadataItem)
        ? findTargetFieldInfo(
            junctionConfig.targetFields,
            targetObjectMetadataItem.id,
            objectMetadataItems,
          )?.joinColumnName
        : undefined;

    if (!isDefined(junctionConfig) || !isDefined(targetJoinColumnName)) {
      return;
    }

    try {
      // Links to custom objects have no unique index for the upsert to
      // resolve, so an existing link is looked up first.
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

      if (
        isNonEmptyArray(
          existingLinks?.[junctionConfig.junctionObjectMetadata.namePlural]
            ?.edges,
        )
      ) {
        return;
      }

      await createLinks({
        recordsToCreate: [
          {
            [junctionConfig.sourceJoinColumnName]: threadId,
            [targetJoinColumnName]: recordId,
          },
        ],
        upsert: true,
      });
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));

      return;
    }

    // The link exists by now, so a failed refresh of the counts is not
    // reported as a failed attach.
    refetchAggregateQueries({
      objectMetadataNamePlural:
        junctionConfig.junctionObjectMetadata.namePlural,
    }).catch(() => undefined);
  };

  return { attachChatThreadToRecord };
};
