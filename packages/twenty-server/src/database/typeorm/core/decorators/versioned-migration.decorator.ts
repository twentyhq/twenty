import 'reflect-metadata';

import { type UpgradeCommandVersion } from 'src/engine/constants/upgrade-command-supported-versions.constant';

const VERSIONED_MIGRATION_KEY = 'VERSIONED_MIGRATION_VERSION';

// When dropping a version from UPGRADE_COMMAND_SUPPORTED_VERSIONS, also
// remove the @VersionedMigration decorator from its associated migration files.
export const VersionedMigration =
  (version: UpgradeCommandVersion): ClassDecorator =>
  (target) => {
    Reflect.defineMetadata(VERSIONED_MIGRATION_KEY, version, target);
  };

export const getVersionedMigrationVersion = (
  target: Function,
): UpgradeCommandVersion | undefined =>
  Reflect.getMetadata(VERSIONED_MIGRATION_KEY, target);
