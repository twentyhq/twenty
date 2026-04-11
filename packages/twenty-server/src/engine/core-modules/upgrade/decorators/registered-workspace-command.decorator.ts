import 'reflect-metadata';

import { type CrossUpgradeSupportedTwentyVersions } from 'src/engine/core-modules/upgrade/constants/upgrade-command-supported-versions.constant';

export type RegisteredWorkspaceCommandMetadata = {
  version: CrossUpgradeSupportedTwentyVersions;
  timestamp: number;
};

const REGISTERED_WORKSPACE_COMMAND_KEY = 'REGISTERED_WORKSPACE_COMMAND';

export const RegisteredWorkspaceCommand =
  (
    version: CrossUpgradeSupportedTwentyVersions,
    timestamp: number,
  ): ClassDecorator =>
  (target) => {
    Reflect.defineMetadata(
      REGISTERED_WORKSPACE_COMMAND_KEY,
      { version, timestamp },
      target,
    );
  };

export const getRegisteredWorkspaceCommandMetadata = (
  target: Function,
): RegisteredWorkspaceCommandMetadata | undefined =>
  Reflect.getMetadata(REGISTERED_WORKSPACE_COMMAND_KEY, target);
