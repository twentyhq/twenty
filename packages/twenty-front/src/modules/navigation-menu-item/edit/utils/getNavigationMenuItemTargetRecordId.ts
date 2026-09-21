import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getNavigationMenuItemTargetRecordId = ({
  objectNameSingular,
  recordId,
  coreWorkflowId,
}: {
  objectNameSingular: string;
  recordId: string;
  coreWorkflowId?: string | null;
}): string =>
  objectNameSingular === CoreObjectNameSingular.Workflow &&
  isDefined(coreWorkflowId)
    ? coreWorkflowId
    : recordId;
