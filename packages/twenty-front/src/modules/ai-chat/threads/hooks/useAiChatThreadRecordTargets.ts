import uniqBy from 'lodash.uniqby';
import { useCallback, useMemo } from 'react';
import { type RecordGqlFields } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useAttachAiChatThreadToRecord } from '@/ai-chat/threads/hooks/useAttachAiChatThreadToRecord';
import { useDetachAiChatThreadFromRecord } from '@/ai-chat/threads/hooks/useDetachAiChatThreadFromRecord';
import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { inboxNamesByLegacyNameSelector } from '@/ai-chat/states/selectors/inboxNamesByLegacyNameSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { generateJunctionRelationGqlFields } from '@/object-record/graphql/record-gql-fields/utils/generateJunctionRelationGqlFields';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useObjectMorphJunctionConfig } from '@/object-record/record-field/ui/hooks/useObjectMorphJunctionConfig';
import { findTargetFieldInfo } from '@/object-record/record-field/ui/utils/junction/findTargetFieldInfo';
import { getRelatedRecordIdFromJunction } from '@/object-record/record-field/ui/utils/junction/getRelatedRecordIdFromJunction';
import { getSearchableObjectMetadataItems } from '@/object-record/record-field/ui/utils/junction/getSearchableObjectMetadataItems';
import { isUsableJunctionConfig } from '@/object-record/record-field/ui/utils/junction/isUsableJunctionConfig';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useFieldWidgetJunctionRelationRecords } from '@/page-layout/widgets/field/hooks/useFieldWidgetJunctionRelationRecords';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useAiChatThreadRecordTargets = ({
  threadId,
  instanceId,
}: {
  threadId: string;
  instanceId: string;
}) => {
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const inboxNamesByLegacyName = useAtomStateValue(
    inboxNamesByLegacyNameSelector,
  );
  const { objectMetadataItems } = useObjectMetadataItems();
  const objectMorphJunctionConfig = useObjectMorphJunctionConfig({
    objectNameSingular: inboxNamesByLegacyName.agentChatThread,
  });
  const junctionConfig = isUsableJunctionConfig(objectMorphJunctionConfig)
    ? objectMorphJunctionConfig
    : null;

  const recordGqlFields = useMemo<RecordGqlFields>(
    () => ({
      id: true,
      ...(isDefined(junctionConfig)
        ? {
            [junctionConfig.junctionField.name]:
              generateJunctionRelationGqlFields({
                junctionConfig,
                objectMetadataItems,
              }),
          }
        : {}),
    }),
    [junctionConfig, objectMetadataItems],
  );

  const isThreadQuerySkipped =
    !isAiChatInboxEnabled || !isDefined(junctionConfig);

  const { record: thread, refetch } = useFindOneRecord({
    objectNameSingular: inboxNamesByLegacyName.agentChatThread,
    objectRecordId: threadId,
    recordGqlFields,
    skip: isThreadQuerySkipped,
  });

  const linksOperationSignature = useMemo(
    () => ({
      objectNameSingular: inboxNamesByLegacyName.agentChatThreadTarget,
      variables: { filter: { threadId: { eq: threadId } } },
    }),
    [inboxNamesByLegacyName.agentChatThreadTarget, threadId],
  );

  useListenToEventsForQuery({
    queryId: `${instanceId}-record-targets`,
    operationSignature: linksOperationSignature,
    skip: isThreadQuerySkipped,
  });

  const handleLinkOperation = useCallback(() => {
    void refetch();
  }, [refetch]);

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleLinkOperation,
    objectMetadataItemId: junctionConfig?.junctionObjectMetadata.id,
    enabled: !isThreadQuerySkipped,
  });

  const junctionRecords: ObjectRecord[] | undefined = isDefined(junctionConfig)
    ? thread?.[junctionConfig.junctionField.name]
    : undefined;

  const junctionTargetRecords = useFieldWidgetJunctionRelationRecords({
    relationValue: junctionRecords,
    junctionConfig: { targetFields: junctionConfig?.targetFields ?? [] },
  });
  const targetRecords = uniqBy(
    junctionTargetRecords,
    ({ record, objectNameSingular }) => `${objectNameSingular}-${record.id}`,
  );

  const { attachChatThreadToRecord } = useAttachAiChatThreadToRecord();
  const { detachChatThreadFromRecord } = useDetachAiChatThreadFromRecord();
  const toggleRecordTarget = ({
    recordId,
    objectNameSingular,
    isLinked,
  }: {
    recordId: string;
    objectNameSingular: string;
    isLinked: boolean;
  }) => {
    const objectMetadataItem = objectMetadataItems.find(
      ({ nameSingular }) => nameSingular === objectNameSingular,
    );

    if (!isDefined(objectMetadataItem) || !isDefined(junctionConfig)) {
      return;
    }

    if (!isLinked) {
      void attachChatThreadToRecord({
        threadId,
        objectNameSingular,
        recordId,
      });

      return;
    }

    const targetFieldInfo = findTargetFieldInfo(
      junctionConfig.targetFields,
      objectMetadataItem.id,
      objectMetadataItems,
    );
    const targetJoinColumnName = targetFieldInfo?.joinColumnName;

    if (!isDefined(targetFieldInfo) || !isDefined(targetJoinColumnName)) {
      return;
    }

    const linkIdsToRecord = (junctionRecords ?? [])
      .filter(
        (junctionRecord) =>
          getRelatedRecordIdFromJunction({
            junctionRecord,
            relationFieldName: targetFieldInfo.fieldName,
            joinColumnName: targetJoinColumnName,
          }) === recordId,
      )
      .map(({ id }) => id);

    void detachChatThreadFromRecord(linkIdsToRecord);
  };

  const searchableObjectNameSingulars = isDefined(junctionConfig)
    ? getSearchableObjectMetadataItems({
        junctionConfig,
        objectMetadataItems,
      }).map(({ nameSingular }) => nameSingular)
    : [];

  return {
    isAvailable: !isThreadQuerySkipped && isDefined(thread),
    targetRecords,
    searchableObjectNameSingulars,
    toggleRecordTarget,
  };
};
