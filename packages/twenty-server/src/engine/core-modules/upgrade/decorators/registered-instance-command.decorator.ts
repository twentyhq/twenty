import 'reflect-metadata';

import { Injectable } from '@nestjs/common';

import { type UpgradeCommandVersion } from 'src/engine/constants/upgrade-command-supported-versions.constant';

export type InstanceCommandType = 'fast' | 'slow';

export type RegisteredInstanceCommandMetadata = {
  version: UpgradeCommandVersion;
  timestamp: number;
  type: InstanceCommandType;
};

const REGISTERED_INSTANCE_COMMAND_KEY = 'REGISTERED_INSTANCE_COMMAND';

// When dropping a version from UPGRADE_COMMAND_SUPPORTED_VERSIONS, also
// remove the @RegisteredInstanceCommand decorator from its associated
// command files.
export const RegisteredInstanceCommand =
  (
    version: UpgradeCommandVersion,
    timestamp: number,
    options?: { type: 'slow' },
  ): ClassDecorator =>
  (target) => {
    Injectable()(target);
    Reflect.defineMetadata(
      REGISTERED_INSTANCE_COMMAND_KEY,
      { version, timestamp, type: options?.type ?? 'fast' },
      target,
    );
  };

export const getRegisteredInstanceCommandMetadata = (
  target: Function,
): RegisteredInstanceCommandMetadata | undefined =>
  Reflect.getMetadata(REGISTERED_INSTANCE_COMMAND_KEY, target);
