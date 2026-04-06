import 'reflect-metadata';

import { Injectable } from '@nestjs/common';

import { type UpgradeCommandVersion } from 'src/engine/constants/upgrade-command-supported-versions.constant';

const REGISTERED_INSTANCE_MIGRATION_KEY =
  'REGISTERED_INSTANCE_MIGRATION_VERSION';

// When dropping a version from UPGRADE_COMMAND_SUPPORTED_VERSIONS, also
// remove the @RegisteredInstanceMigration decorator from its associated
// migration files.
export const RegisteredInstanceMigration =
  (version: UpgradeCommandVersion): ClassDecorator =>
  (target) => {
    Injectable()(target);
    Reflect.defineMetadata(REGISTERED_INSTANCE_MIGRATION_KEY, version, target);
  };

export const getRegisteredInstanceMigrationVersion = (
  target: Function,
): UpgradeCommandVersion | undefined =>
  Reflect.getMetadata(REGISTERED_INSTANCE_MIGRATION_KEY, target);
