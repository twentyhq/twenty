import 'reflect-metadata';

import { type UpgradeCommandVersion } from 'src/engine/constants/upgrade-command-supported-versions.constant';

const REGISTERED_INSTANCE_MIGRATION_KEY =
  'REGISTERED_INSTANCE_MIGRATION_VERSION';

export const RegisteredInstanceMigration =
  (version: UpgradeCommandVersion): ClassDecorator =>
  (target) => {
    Reflect.defineMetadata(REGISTERED_INSTANCE_MIGRATION_KEY, version, target);
  };

export const getRegisteredInstanceMigration = (
  target: Function,
): UpgradeCommandVersion | undefined =>
  Reflect.getMetadata(REGISTERED_INSTANCE_MIGRATION_KEY, target);
