import { CoreObjectNameSingular } from 'twenty-shared/types';

export const isWorkspaceWorkflowVersionRouteHidden = ({
  objectNameSingular,
  isWorkflowCoreIndexPageEnabled,
}: {
  objectNameSingular?: string | null;
  isWorkflowCoreIndexPageEnabled: boolean;
}) =>
  isWorkflowCoreIndexPageEnabled &&
  objectNameSingular === CoreObjectNameSingular.WorkflowVersion;
