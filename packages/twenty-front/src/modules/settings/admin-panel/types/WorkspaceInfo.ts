import { type WorkspaceLookupAdminPanelQuery } from '~/generated-admin/graphql';

export type WorkspaceInfo = Omit<
  WorkspaceLookupAdminPanelQuery['workspaceLookupAdminPanel']['workspaces'][number],
  'users'
>;
