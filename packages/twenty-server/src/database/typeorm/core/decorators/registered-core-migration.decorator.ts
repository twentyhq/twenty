import 'reflect-metadata';

import { type UpgradeCommandVersion } from 'src/engine/constants/upgrade-command-supported-versions.constant';

const REGISTERED_CORE_MIGRATION_KEY = 'REGISTERED_CORE_MIGRATION_VERSION';

// When dropping a version from UPGRADE_COMMAND_SUPPORTED_VERSIONS, also
// remove the @RegisteredCoreMigration decorator from its associated migration files.
export const RegisteredCoreMigration =
  (version: UpgradeCommandVersion): ClassDecorator =>
  (target) => {
    Reflect.defineMetadata(REGISTERED_CORE_MIGRATION_KEY, version, target);
  };

export const getRegisteredCoreMigrationVersion = (
  target: Function,
): UpgradeCommandVersion | undefined =>
  Reflect.getMetadata(REGISTERED_CORE_MIGRATION_KEY, target);
