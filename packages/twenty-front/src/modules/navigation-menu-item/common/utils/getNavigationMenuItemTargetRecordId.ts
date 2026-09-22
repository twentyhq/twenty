import { isNonEmptyString } from '@sniptt/guards';
import { CoreObjectNameSingular } from 'twenty-shared/types';

export const getNavigationMenuItemTargetRecordId = ({
  objectNameSingular,
  record,
}: {
  objectNameSingular: string;
  record: { id: string; coreWorkflowId?: unknown };
}): string =>
  objectNameSingular === CoreObjectNameSingular.Workflow &&
  isNonEmptyString(record.coreWorkflowId)
    ? record.coreWorkflowId
    : record.id;
