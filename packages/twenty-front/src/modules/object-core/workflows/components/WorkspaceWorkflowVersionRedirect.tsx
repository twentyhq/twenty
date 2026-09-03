import { Navigate } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';

export const WorkspaceWorkflowVersionRedirect = () => (
  <Navigate
    to={getAppPath(AppPath.RecordIndexPage, {
      objectNamePlural: CoreObjectNamePlural.Workflow,
    })}
    replace
  />
);
