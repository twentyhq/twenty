import { CoreObjectNameSingular } from 'twenty-shared/types';

export const isCoreWorkflowsIndexEnabled = ({
  objectNameSingular,
  isWorkflowCoreIndexPageEnabled,
}: {
  objectNameSingular?: string | null;
  isWorkflowCoreIndexPageEnabled: boolean;
}) =>
  isWorkflowCoreIndexPageEnabled &&
  objectNameSingular === CoreObjectNameSingular.Workflow;
