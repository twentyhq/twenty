import { CoreObjectNameSingular } from 'twenty-shared/types';

export const isWorkspaceWorkflowVersionRouteHidden = ({
  objectNameSingular,
}: {
  objectNameSingular?: string | null;
}) => objectNameSingular === CoreObjectNameSingular.WorkflowVersion;
