import 'reflect-metadata';

import { Injectable } from '@nestjs/common';

import { type UpgradeCommandVersion } from 'src/engine/constants/upgrade-command-supported-versions.constant';

export type RegisteredInstanceMigrationMetadata = {
  version: UpgradeCommandVersion;
  timestamp: number;
};

const REGISTERED_INSTANCE_MIGRATION_KEY = 'REGISTERED_INSTANCE_MIGRATION';

// When dropping a version from UPGRADE_COMMAND_SUPPORTED_VERSIONS, also
// remove the @RegisteredInstanceMigration decorator from its associated
// migration files.
export const RegisteredInstanceMigration =
  (version: UpgradeCommandVersion, timestamp: number): ClassDecorator =>
  (target) => {
    Injectable()(target);
    Reflect.defineMetadata(
      REGISTERED_INSTANCE_MIGRATION_KEY,
      { version, timestamp },
      target,
    );
  };

export const getRegisteredInstanceMigrationMetadata = (
  target: Function,
): RegisteredInstanceMigrationMetadata | undefined =>
  Reflect.getMetadata(REGISTERED_INSTANCE_MIGRATION_KEY, target);
