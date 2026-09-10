import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

export const WORKSPACE_FIELDS_UPDATABLE_BEFORE_ACTIVATION = {
  displayName: true,
  subdomain: true,
  logo: true,
} as const satisfies Partial<Record<keyof WorkspaceEntity, true>>;
