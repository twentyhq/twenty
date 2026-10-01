import uniqBy from 'lodash.uniqby';
import { useCallback, useMemo } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useAttachChatThreadToRecord } from '@/ai/hooks/useAttachChatThreadToRecord';
import { useDetachChatThreadFromRecord } from '@/ai/hooks/useDetachChatThreadFromRecord';
import { type AgentChatConversationTarget } from '@/ai/types/AgentChatConversationTarget';
import { agentChatThreadPermissionsFamilySelector } from '@/ai/states/selectors/agentChatThreadPermissionsFamilySelector';
import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { filterReadableActiveObjectMetadataItems } from '@/object-metadata/utils/filterReadableActiveObjectMetadataItems';
import { generateJunctionRelationGqlFields } from '@/object-record/graphql/record-gql-fields/utils/generateJunctionRelationGqlFields';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useObjectMorphJunctionConfig } from '@/object-record/record-field/ui/hooks/useObjectMorphJunctionConfig';
import { findTargetFieldInfo } from '@/object-record/record-field/ui/utils/junction/findTargetFieldInfo';
import { getRelatedRecordIdFromJunction } from '@/object-record/record-field/ui/utils/junction/getRelatedRecordIdFromJunction';
import { getSearchableObjectMetadataItems } from '@/object-record/record-field/ui/utils/junction/getSearchableObjectMetadataItems';
import { isUsableJunctionConfig } from '@/object-record/record-field/ui/utils/junction/isUsableJunctionConfig';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useFieldWidgetJunctionRelationRecords } from '@/page-layout/widgets/field/hooks/useFieldWidgetJunctionRelationRecords';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useAiChatThreadLinkedRecords = ({
  threadId,
  instanceId,
}: {
  threadId: string;
  instanceId: string;
}) => {
  const isConversationsTabEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CONVERSATIONS_TAB_ENABLED,
  );
  const { objectMetadataItems } = useObjectMetadataItems();
  const objectMorphJunctionConfig = useObjectMorphJunctionConfig({
    objectNameSingular: CoreObjectNameSingular.AgentChatThread,
  });
  const junctionConfig = isUsableJunctionConfig(objectMorphJunctionConfig)
    ? objectMorphJunctionConfig
    : null;

  const recordGqlFields = useMemo(
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
    !isConversationsTabEnabled || !isDefined(junctionConfig);

  const { record: thread, refetch } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.AgentChatThread,
    objectRecordId: threadId,
    recordGqlFields,
    skip: isThreadQuerySkipped,
  });

  // The chat model links conversations through its own server tool, so links are reread on any write.
  const linksOperationSignature = useMemo(
    () => ({
      objectNameSingular: CoreObjectNameSingular.AgentChatThreadTarget,
      variables: { filter: { threadId: { eq: threadId } } },
    }),
    [threadId],
  );

  useListenToEventsForQuery({
    queryId: `${instanceId}-${threadId}-linked-records`,
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

  const junctionRelationRecords = useFieldWidgetJunctionRelationRecords({
    relationValue: junctionRecords,
    junctionConfig: { targetFields: junctionConfig?.targetFields ?? [] },
  });
  // A custom leg allows duplicate links, so a record is listed once
  const linkedRecords = uniqBy(
    junctionRelationRecords,
    ({ objectNameSingular, record }) => `${objectNameSingular}-${record.id}`,
  );

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  // A search over an object the member cannot read fails as a whole
  const linkableObjectMetadataItems = useMemo(
    () =>
      isDefined(junctionConfig)
        ? filterReadableActiveObjectMetadataItems(
            getSearchableObjectMetadataItems(
              junctionConfig.targetFields,
              objectMetadataItems,
            ),
            objectPermissionsByObjectMetadataId,
          )
        : [],
    [junctionConfig, objectMetadataItems, objectPermissionsByObjectMetadataId],
  );

  const permissions = useAtomFamilySelectorValue(
    agentChatThreadPermissionsFamilySelector,
    threadId,
  );
  const { attachChatThreadToRecord } = useAttachChatThreadToRecord();
  const { detachChatThreadFromRecord } = useDetachChatThreadFromRecord();

  const linkRecord = ({
    objectNameSingular,
    recordId,
  }: AgentChatConversationTarget) =>
    attachChatThreadToRecord({ threadId, objectNameSingular, recordId });

  // Every link to the record goes, duplicates included
  const unlinkRecord = ({
    objectNameSingular,
    recordId,
  }: AgentChatConversationTarget) => {
    const objectMetadataItem = objectMetadataItems.find(
      ({ nameSingular }) => nameSingular === objectNameSingular,
    );
    const targetFieldInfo =
      isDefined(junctionConfig) && isDefined(objectMetadataItem)
        ? findTargetFieldInfo(
            junctionConfig.targetFields,
            objectMetadataItem.id,
            objectMetadataItems,
          )
        : undefined;
    const joinColumnName = targetFieldInfo?.joinColumnName;

    if (!isDefined(targetFieldInfo) || !isDefined(joinColumnName)) {
      return;
    }

    const linkIds = (junctionRecords ?? [])
      .filter(
        (junctionRecord) =>
          getRelatedRecordIdFromJunction({
            junctionRecord,
            relationFieldName: targetFieldInfo.fieldName,
            joinColumnName,
          }) === recordId,
      )
      .map(({ id }) => id);

    return detachChatThreadFromRecord(linkIds);
  };

  return {
    isAvailable: !isThreadQuerySkipped && isDefined(thread),
    linkedRecords,
    linkableObjectMetadataItems,
    canEditLinkedRecords: permissions?.canUpdate ?? false,
    linkRecord,
    unlinkRecord,
  };
};
