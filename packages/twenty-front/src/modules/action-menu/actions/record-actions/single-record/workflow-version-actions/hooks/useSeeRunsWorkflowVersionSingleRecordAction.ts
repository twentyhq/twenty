import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { ActionHookWithoutObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import qs from 'qs';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';

export const useSeeRunsWorkflowVersionSingleRecordAction: ActionHookWithoutObjectMetadataItem =
  () => {
    const recordId = useSelectedRecordIdOrThrow();

    const workflowVersion = useRecoilValue(recordStoreFamilyState(recordId));

    const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(
      workflowVersion?.workflow.id,
    );

    const navigate = useNavigate();

    const shouldBeRegistered = isDefined(workflowWithCurrentVersion);

    const onClick = () => {
      if (!shouldBeRegistered) return;

      const filterQueryParams = {
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
      };
      const filterLinkHref = `/objects/${CoreObjectNamePlural.WorkflowRun}?${qs.stringify(
        filterQueryParams,
      )}`;

      navigate(filterLinkHref);
    };

    return {
      shouldBeRegistered,
      onClick,
    };
  };
