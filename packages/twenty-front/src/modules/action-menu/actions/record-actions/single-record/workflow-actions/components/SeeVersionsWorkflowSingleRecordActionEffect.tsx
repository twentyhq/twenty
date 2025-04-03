import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { AppPath } from '@/types/AppPath';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const SeeVersionsWorkflowSingleRecordActionEffect = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const navigate = useNavigateApp();
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(recordId);

  useEffect(() => {
    if (!isDefined(workflowWithCurrentVersion)) {
      return;
    }

    navigate(
      AppPath.RecordIndexPage,
      {
        objectNamePlural: CoreObjectNamePlural.WorkflowVersion,
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
