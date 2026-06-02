import { type WorkspaceLookupAdminPanelQuery } from '~/generated-admin/graphql';

export type WorkspaceInfo =
  WorkspaceLookupAdminPanelQuery['workspaceLookupAdminPanel']['workspaces'][number];
