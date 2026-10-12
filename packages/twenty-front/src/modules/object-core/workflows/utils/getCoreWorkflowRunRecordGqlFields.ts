import { CoreObjectNameSingular } from 'twenty-shared/types';

export const getCoreWorkflowRunRecordGqlFields = ({
  objectNameSingular,
  isWorkflowCoreIndexPageEnabled,
}: {
  objectNameSingular: string;
  isWorkflowCoreIndexPageEnabled: boolean;
}) =>
  isWorkflowCoreIndexPageEnabled &&
  objectNameSingular === CoreObjectNameSingular.WorkflowRun
    ? { coreWorkflowId: true, coreWorkflowVersionId: true }
    : {};
