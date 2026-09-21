import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

export const getSearchResultItemShowPagePath = ({
  objectNameSingular,
  recordId,
  coreWorkflowId,
  isWorkflowCoreEnabled,
}: {
  objectNameSingular: string;
  recordId: string;
  coreWorkflowId?: string | null;
  isWorkflowCoreEnabled: boolean;
}): string | null => {
  if (
    isWorkflowCoreEnabled &&
    objectNameSingular === CoreObjectNameSingular.Workflow
  ) {
    return isDefined(coreWorkflowId)
      ? getAppPath(AppPath.WorkflowCoreShowPage, { coreWorkflowId })
      : null;
  }

  return getAppPath(AppPath.RecordShowPage, {
    objectNameSingular,
    objectRecordId: recordId,
  });
};
