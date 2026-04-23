import { type BaseFlatCreateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-flat-create-workspace-migration-action.type';
import { type BaseFlatDeleteWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-flat-delete-workspace-migration-action.type';
import { type BaseFlatUpdateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-flat-update-workspace-migration-action.type';
import { type BaseUniversalCreateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-universal-create-workspace-migration-action.type';
import { type BaseUniversalDeleteWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-universal-delete-workspace-migration-action.type';
import { type BaseUniversalUpdateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-universal-update-workspace-migration-action.type';

export type FlatCreateRoleTargetAction =
  BaseFlatCreateWorkspaceMigrationAction<'roleTarget'>;

export type UniversalCreateRoleTargetAction =
  BaseUniversalCreateWorkspaceMigrationAction<'roleTarget'>;

export type FlatUpdateRoleTargetAction =
  BaseFlatUpdateWorkspaceMigrationAction<'roleTarget'>;

export type UniversalUpdateRoleTargetAction =
  BaseUniversalUpdateWorkspaceMigrationAction<'roleTarget'>;

export type UniversalDeleteRoleTargetAction =
  BaseUniversalDeleteWorkspaceMigrationAction<'roleTarget'>;

export type FlatDeleteRoleTargetAction =
  BaseFlatDeleteWorkspaceMigrationAction<'roleTarget'>;
