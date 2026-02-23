import { ActionLink } from '@/action-menu/actions/components/ActionLink';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useFamilyRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilyRecoilValueV2';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const SeeWorkflowWorkflowRunSingleRecordAction = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const workflowRun = useFamilyRecoilValueV2(recordStoreFamilyState, recordId);

  if (!isDefined(workflowRun) || !isDefined(workflowRun?.workflow?.id)) {
    return null;
  }

  return (
    <ActionLink
      to={AppPath.RecordShowPage}
      params={{
        objectNameSingular: CoreObjectNameSingular.Workflow,
        objectRecordId: workflowRun.workflow.id,
      }}
    />
  );
};
