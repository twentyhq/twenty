import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useActionEffect } from '@/action-menu/hooks/useActionEffect';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { AppPath } from '@/types/AppPath';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const SeeRunsWorkflowSingleRecordActionEffect = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const navigate = useNavigateApp();
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(recordId);

  useActionEffect(() => {
    if (!isDefined(workflowWithCurrentVersion)) {
      return;
    }

    navigate(
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
        },
      },
    );
  }, [navigate, workflowWithCurrentVersion]);

  return null;
};
