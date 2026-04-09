import { type BaseFlatCreateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-flat-create-workspace-migration-action.type';
import { type BaseFlatDeleteWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-flat-delete-workspace-migration-action.type';
import { type BaseFlatUpdateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-flat-update-workspace-migration-action.type';
import { type BaseUniversalCreateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-universal-create-workspace-migration-action.type';
import { type BaseUniversalDeleteWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-universal-delete-workspace-migration-action.type';
import { type BaseUniversalUpdateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-universal-update-workspace-migration-action.type';

export type FlatCreateAgentAction =
  BaseFlatCreateWorkspaceMigrationAction<'agent'>;

export type UniversalCreateAgentAction =
  BaseUniversalCreateWorkspaceMigrationAction<'agent'>;

export type FlatUpdateAgentAction =
  BaseFlatUpdateWorkspaceMigrationAction<'agent'>;

export type UniversalUpdateAgentAction =
  BaseUniversalUpdateWorkspaceMigrationAction<'agent'>;

export type UniversalDeleteAgentAction =
  BaseUniversalDeleteWorkspaceMigrationAction<'agent'>;

export type FlatDeleteAgentAction =
  BaseFlatDeleteWorkspaceMigrationAction<'agent'>;
