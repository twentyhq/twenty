import { SingleRecordActionHookWithoutObjectMetadataItem } from '@/action-menu/actions/types/SingleRecordActionHook';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { FilterQueryParams } from '@/views/hooks/internal/useViewFromQueryParams';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import qs from 'qs';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';

export const useSeeRunsWorkflowVersionSingleRecordAction: SingleRecordActionHookWithoutObjectMetadataItem =
  ({ recordId }) => {
    const workflowVersion = useRecoilValue(recordStoreFamilyState(recordId));

    const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(
      workflowVersion?.workflow.id,
    );

    const navigate = useNavigate();

    const shouldBeRegistered = isDefined(workflowWithCurrentVersion);

    const onClick = () => {
      if (!shouldBeRegistered) return;

      const filterQueryParams: FilterQueryParams = {
        filter: {
          workflow: {
            [ViewFilterOperand.Is]: [workflowWithCurrentVersion.id],
          },
          workflowVersion: {
            [ViewFilterOperand.Is]: [recordId],
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
