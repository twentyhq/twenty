import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDuplicateWorkflow } from '@/workflow/hooks/useDuplicateWorkflow';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { useState } from 'react';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const DuplicateWorkflowSingleRecordAction = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const workflow = useWorkflowWithCurrentVersion(recordId);
  const { duplicateWorkflow } = useDuplicateWorkflow();
  const navigate = useNavigateApp();
  const [hasNavigated, setHasNavigated] = useState(false);

  const handleClick = async () => {
    if (
      !isDefined(workflow) ||
      !isDefined(workflow.currentVersion) ||
      hasNavigated
    ) {
      return;
    }

    const result = await duplicateWorkflow({
      workflowIdToDuplicate: workflow.id,
      workflowVersionIdToCopy: workflow.currentVersion.id,
    });

    if (isDefined(result?.workflowId)) {
      navigate(AppPath.RecordShowPage, {
        objectNameSingular: CoreObjectNameSingular.Workflow,
        objectRecordId: result?.workflowId,
      });

      setHasNavigated(true);
    }
  };

  return isDefined(workflow) ? <Action onClick={handleClick} /> : null;
};
