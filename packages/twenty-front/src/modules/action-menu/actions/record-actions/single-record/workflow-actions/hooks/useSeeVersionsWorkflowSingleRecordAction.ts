import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { ActionHookWithoutObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { AppPath } from '@/types/AppPath';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { isDefined } from 'twenty-ui';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useSeeVersionsWorkflowSingleRecordAction: ActionHookWithoutObjectMetadataItem =
  () => {
    const recordId = useSelectedRecordIdOrThrow();

    const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(recordId);

    const navigateApp = useNavigateApp();

    const shouldBeRegistered = isDefined(workflowWithCurrentVersion);

    const onClick = () => {
      if (!shouldBeRegistered) return;

      navigateApp(
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
    };

    return {
      shouldBeRegistered,
      onClick,
    };
  };
