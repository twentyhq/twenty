import { FormSingleRecordPicker } from '@/object-record/record-field/ui/form-types/components/FormSingleRecordPicker';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useSidePanelWorkflowIdOrThrow } from '@/side-panel/pages/workflow/hooks/useSidePanelWorkflowIdOrThrow';
import { useRunWorkflowVersion } from '@/workflow/hooks/useRunWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { type WorkflowDatabaseEventTrigger } from '@/workflow/types/Workflow';
import { buildDatabaseEventTestPayload } from '@/workflow/workflow-trigger/utils/buildDatabaseEventTestPayload';
import { t } from '@lingui/core/macro';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { IconPlayerPlay } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';

type WorkflowEditTriggerDatabaseEventTestRecordProps = {
  trigger: WorkflowDatabaseEventTrigger;
  objectNameSingular: string;
  onTriggerUpdate: (trigger: WorkflowDatabaseEventTrigger) => void;
};

export const WorkflowEditTriggerDatabaseEventTestRecord = ({
  trigger,
  objectNameSingular,
  onTriggerUpdate,
}: WorkflowEditTriggerDatabaseEventTestRecordProps) => {
  const workflowId = useSidePanelWorkflowIdOrThrow();
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(workflowId);
  const { runWorkflowVersion } = useRunWorkflowVersion();

  const testRecordId = trigger.settings.testRecordId ?? undefined;

  const { record: testRecord, loading } = useFindOneRecord({
    objectNameSingular,
    objectRecordId: testRecordId,
  });

  const handleTestRecordChange = (value: string | null) => {
    onTriggerUpdate({
      ...trigger,
      settings: {
        ...trigger.settings,
        testRecordId: isDefined(value) && isValidUuid(value) ? value : null,
      },
    });
  };

  const handleTest = async () => {
    if (!isDefined(testRecord) || !isDefined(workflowWithCurrentVersion)) {
      return;
    }

    await runWorkflowVersion({
      workflowId,
      workflowVersionId: workflowWithCurrentVersion.currentVersion.id,
      payload: buildDatabaseEventTestPayload({
        eventName: trigger.settings.eventName,
        record: testRecord,
        watchedFields: trigger.settings.fields,
      }),
    });
  };

  return (
    <>
      <FormSingleRecordPicker
        label={t`Test Record`}
        defaultValue={testRecordId}
        objectNameSingulars={[objectNameSingular]}
        onChange={handleTestRecordChange}
        onClear={() => handleTestRecordChange(null)}
        testId="workflow-edit-trigger-database-event-test-record"
      />
      <Button
        title={t`Test`}
        Icon={IconPlayerPlay}
        justify="center"
        disabled={loading || !isDefined(testRecord)}
        onClick={handleTest}
      />
    </>
  );
};
