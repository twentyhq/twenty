import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useRunWorkflowVersion } from '@/workflow/hooks/useRunWorkflowVersion';
import { useWorkflowVersionContent } from '@/workflow/workflow-version/hooks/useWorkflowVersionContent';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { splitWorkflowTriggerEventName } from '@/workflow/utils/splitWorkflowTriggerEventName';
import { getTestPayloadFromTrigger } from '@/workflow/workflow-trigger/utils/getTestPayloadFromTrigger';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const TestWorkflowSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();

  const recordId = selectedRecords[0]?.id;
  const { runWorkflowVersion } = useRunWorkflowVersion();
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(
    recordId ?? '',
  );
  const { content } = useWorkflowVersionContent(
    workflowWithCurrentVersion?.currentVersion.id,
  );
  const { objectMetadataItems } = useObjectMetadataItems();

  const trigger = content?.trigger;
  const databaseEventTrigger =
    trigger?.type === 'DATABASE_EVENT' ? trigger : undefined;

  const triggerObjectMetadataItem = isDefined(databaseEventTrigger)
    ? objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.nameSingular ===
          splitWorkflowTriggerEventName(databaseEventTrigger.settings.eventName)
            .objectType,
      )
    : undefined;

  const { record: databaseEventTestRecord, loading } = useFindOneRecord({
    objectNameSingular:
      triggerObjectMetadataItem?.nameSingular ?? CoreObjectNameSingular.Person,
    objectRecordId: databaseEventTrigger?.settings.testRecordId ?? undefined,
    skip: !isDefined(triggerObjectMetadataItem),
  });

  if (!isDefined(recordId)) {
    throw new Error('Record ID is required to test workflow');
  }

  const handleExecute = () => {
    if (!isDefined(workflowWithCurrentVersion) || !isDefined(trigger)) {
      return;
    }

    runWorkflowVersion({
      workflowVersionId: workflowWithCurrentVersion.currentVersion.id,
      workflowId: workflowWithCurrentVersion.id,
      payload: getTestPayloadFromTrigger({ trigger, databaseEventTestRecord }),
    });
  };

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={handleExecute}
      ready={
        isDefined(workflowWithCurrentVersion) && isDefined(content) && !loading
      }
    />
  );
};
