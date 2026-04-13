import 'reflect-metadata';

import { type TwentyCrossUpgradeSupportedVersion } from 'src/engine/core-modules/upgrade/constants/twenty-cross-upgrade-supported-version.constant';

export type RegisteredWorkspaceCommandMetadata = {
  version: TwentyCrossUpgradeSupportedVersion;
  timestamp: number;
};

const REGISTERED_WORKSPACE_COMMAND_KEY = 'REGISTERED_WORKSPACE_COMMAND';

export const RegisteredWorkspaceCommand =
  (
    version: TwentyCrossUpgradeSupportedVersion,
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
