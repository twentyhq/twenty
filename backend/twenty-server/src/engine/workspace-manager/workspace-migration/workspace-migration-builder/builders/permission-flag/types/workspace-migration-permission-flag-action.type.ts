import { type BaseFlatCreateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-flat-create-workspace-migration-action.type';
import { type BaseFlatDeleteWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-flat-delete-workspace-migration-action.type';
import { type BaseFlatUpdateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-flat-update-workspace-migration-action.type';
import { type BaseUniversalCreateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-universal-create-workspace-migration-action.type';
import { type BaseUniversalDeleteWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-universal-delete-workspace-migration-action.type';
import { type BaseUniversalUpdateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-universal-update-workspace-migration-action.type';

export type FlatCreatePermissionFlagAction =
  BaseFlatCreateWorkspaceMigrationAction<'permissionFlag'>;

export type FlatUpdatePermissionFlagAction =
  BaseFlatUpdateWorkspaceMigrationAction<'permissionFlag'>;

export type FlatDeletePermissionFlagAction =
  BaseFlatDeleteWorkspaceMigrationAction<'permissionFlag'>;

export type UniversalCreatePermissionFlagAction =
  BaseUniversalCreateWorkspaceMigrationAction<'permissionFlag'>;

export type UniversalUpdatePermissionFlagAction =
  BaseUniversalUpdateWorkspaceMigrationAction<'permissionFlag'>;

export type UniversalDeletePermissionFlagAction =
  BaseUniversalDeleteWorkspaceMigrationAction<'permissionFlag'>;
