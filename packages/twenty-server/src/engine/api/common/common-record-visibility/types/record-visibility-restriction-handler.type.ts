import { type ObjectRecord } from 'twenty-shared/types';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

export type RecordVisibilityRestrictionHandler = {
  applyVisibilityRestrictions: (args: {
    records: ObjectRecord[];
    authContext: WorkspaceAuthContext;
  }) => Promise<void>;
};
