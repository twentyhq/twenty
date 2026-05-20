import type { Command } from 'commander';
import { registerAppCommands } from './app';
import { registerDeprecatedCommands } from './deprecated';
import { registerDevCommands } from './dev';
import { registerServerCommands } from './docker';
import { registerRemoteCommands } from './remote';

export const registerCommands = (program: Command): void => {
  registerDevCommands(program);
  registerAppCommands(program);
  registerServerCommands(program);
  registerRemoteCommands(program);
  registerDeprecatedCommands(program);
};
