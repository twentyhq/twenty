import { StandardObjectNameSingular } from 'twenty-shared/types';

export const isWorkspaceWorkflowVersionRouteHidden = ({
  objectNameSingular,
}: {
  objectNameSingular?: string | null;
}) => objectNameSingular === StandardObjectNameSingular.WorkflowVersion;
