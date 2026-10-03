import uniqBy from 'lodash.uniqby';
import { useCallback, useMemo } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useAttachChatThreadToRecord } from '@/ai/hooks/useAttachChatThreadToRecord';
import { useDetachChatThreadFromRecord } from '@/ai/hooks/useDetachChatThreadFromRecord';
import { agentChatThreadPermissionsFamilySelector } from '@/ai/states/selectors/agentChatThreadPermissionsFamilySelector';
import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { generateJunctionRelationGqlFields } from '@/object-record/graphql/record-gql-fields/utils/generateJunctionRelationGqlFields';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useObjectMorphJunctionConfig } from '@/object-record/record-field/ui/hooks/useObjectMorphJunctionConfig';
import { useOpenJunctionRelationPicker } from '@/object-record/record-field/ui/hooks/useOpenJunctionRelationPicker';
import { findTargetFieldInfo } from '@/object-record/record-field/ui/utils/junction/findTargetFieldInfo';
import { getRelatedRecordIdFromJunction } from '@/object-record/record-field/ui/utils/junction/getRelatedRecordIdFromJunction';
import { isUsableJunctionConfig } from '@/object-record/record-field/ui/utils/junction/isUsableJunctionConfig';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useFieldWidgetJunctionRelationRecords } from '@/page-layout/widgets/field/hooks/useFieldWidgetJunctionRelationRecords';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useAiChatThreadRecordTargets = ({
  threadId,
  recordPickerInstanceId,
}: {
  threadId: string;
  recordPickerInstanceId: string;
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
    queryId: `${recordPickerInstanceId}-record-targets`,
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
  // A chat can hold several links to the same record
  const targetRecords = uniqBy(
    junctionTargetRecords,
    ({ record, objectNameSingular }) => `${objectNameSingular}-${record.id}`,
  );

  const permissions = useAtomFamilySelectorValue(
    agentChatThreadPermissionsFamilySelector,
    threadId,
  );
  const { attachChatThreadToRecord } = useAttachChatThreadToRecord();
  const { detachChatThreadFromRecord } = useDetachChatThreadFromRecord();
  const { openJunctionRelationPicker } = useOpenJunctionRelationPicker();

  const openRecordPicker = () => {
    if (!isDefined(junctionConfig)) {
      return;
    }

    openJunctionRelationPicker({
      recordPickerInstanceId,
      junctionRecords,
      targetFields: junctionConfig.targetFields,
    });
  };

  const handleRecordPickerChange = (
    morphItem: RecordPickerPickableMorphItem,
  ) => {
    const objectMetadataItem = objectMetadataItems.find(
      ({ id }) => id === morphItem.objectMetadataId,
    );

    if (!isDefined(objectMetadataItem) || !isDefined(junctionConfig)) {
      return;
    }

    if (morphItem.isSelected) {
      void attachChatThreadToRecord({
        threadId,
        objectNameSingular: objectMetadataItem.nameSingular,
        recordId: morphItem.recordId,
      });

      return;
    }

    const targetFieldInfo = findTargetFieldInfo(
      junctionConfig.targetFields,
      morphItem.objectMetadataId,
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
          }) === morphItem.recordId,
      )
      .map(({ id }) => id);

    void detachChatThreadFromRecord(linkIdsToRecord);
  };

  return {
    isAvailable: !isThreadQuerySkipped && isDefined(thread),
    targetRecords,
    canEditRecordTargets: permissions?.canUpdate ?? false,
    openRecordPicker,
    handleRecordPickerChange,
  };
};
