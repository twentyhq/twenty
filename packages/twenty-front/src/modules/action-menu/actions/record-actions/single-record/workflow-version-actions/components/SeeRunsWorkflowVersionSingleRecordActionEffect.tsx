import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { AppPath } from '@/types/AppPath';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const SeeRunsWorkflowVersionSingleRecordActionEffect = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const workflowVersion = useRecoilValue(recordStoreFamilyState(recordId));
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(
    workflowVersion?.workflow.id,
  );
  const navigateApp = useNavigateApp();

  useEffect(() => {
    if (!isDefined(workflowWithCurrentVersion)) {
      return;
    }

    navigateApp(
      AppPath.RecordIndexPage,
      {
        objectNamePlural: CoreObjectNamePlural.WorkflowRun,
      },
      {
        filter: {
          workflow: {
            [ViewFilterOperand.Is]: {
              selectedRecordIds: [workflowWithCurrentVersion.id],
            },
          },
          workflowVersion: {
            [ViewFilterOperand.Is]: {
              selectedRecordIds: [recordId],
            },
          },
        },
      },
    );
  }, [navigateApp, workflowWithCurrentVersion, recordId]);

  return null;
};
