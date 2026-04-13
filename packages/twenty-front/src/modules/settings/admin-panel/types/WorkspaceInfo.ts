import { type WorkspaceLookupAdminPanelQuery } from '~/generated-metadata/graphql';

export type WorkspaceInfo =
  WorkspaceLookupAdminPanelQuery['workspaceLookupAdminPanel']['workspaces'][number];
