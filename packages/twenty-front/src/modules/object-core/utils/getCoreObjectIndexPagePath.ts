import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

export const getCoreObjectIndexPagePath = (objectNamePlural: string) =>
  objectNamePlural === CoreObjectNamePlural.Workflow
    ? getAppPath(AppPath.WorkflowCoreIndexPage)
    : undefined;
