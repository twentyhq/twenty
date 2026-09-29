import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components';

import { findAgentChatThreadTargetFieldInfo } from '@/ai/utils/findAgentChatThreadTargetFieldInfo';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { useObjectMorphJunctionConfig } from '@/object-record/record-field/ui/hooks/useObjectMorphJunctionConfig';
import { type SearchRecord } from '~/generated/graphql';

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
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));

      return false;
    }

    // The link exists by now, so a failed refresh of the counts must not
    // report the attach as failed and get it retried.
    refetchAggregateQueries({
      objectMetadataNamePlural:
        junctionConfig.junctionObjectMetadata.namePlural,
    }).catch(() => undefined);

    return true;
  };

  return { attachChatThreadToRecord };
};
