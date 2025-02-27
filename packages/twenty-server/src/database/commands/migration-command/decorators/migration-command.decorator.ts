// migration-command.decorator.ts
import { Type } from '@nestjs/common';

import { Command, CommandMetadata } from 'nest-commander';
import 'reflect-metadata';

import { MigrationCommandRunner } from 'src/database/commands/migration-command/migration-command.runner';

export interface MigrationCommandMetadata extends CommandMetadata {
  version: string;
}

const MIGRATION_COMMANDS = new Map<
  string,
  Array<Type<MigrationCommandRunner>>
>();

export function MigrationCommand(
  options: MigrationCommandMetadata,
): <T extends Type<MigrationCommandRunner>>(target: T) => T | void {
  return <T extends Type<MigrationCommandRunner>>(target: T): T | void => {
    const { version, name, ...commandOptions } = options;

    if (!MIGRATION_COMMANDS.has(version)) {
      MIGRATION_COMMANDS.set(version, []);
    }

    MIGRATION_COMMANDS.get(version)?.push(target);

    return Command({
      name: `upgrade-${version}:${name}`,
      ...commandOptions,
    })(target);
  };
}

export function getMigrationCommandsForVersion(
  version: string,
): Array<Type<MigrationCommandRunner>> {
  return MIGRATION_COMMANDS.get(version) || [];
}
