import * as fs from 'fs';
import * as path from 'path';

import { Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';

import { InstanceCommandGenerationService } from 'src/database/commands/instance-command-generation.service';
import {
  TWENTY_ALL_VERSIONS,
  type TwentyAllVersion,
} from 'src/engine/core-modules/upgrade/constants/twenty-all-versions.constant';
import { TWENTY_CURRENT_VERSION } from 'src/engine/core-modules/upgrade/constants/twenty-current-version.constant';
import { type InstanceCommandType } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';

const UPGRADE_VERSION_COMMAND_DIR = path.resolve(
  process.cwd(),
  'src/database/commands/upgrade-version-command',
);

type GenerateInstanceCommandOptions = {
  name: string;
  type: InstanceCommandType;
  version?: TwentyAllVersion;
};

@Command({
  name: 'generate:instance-command',
  description:
    'Generate an instance command with @RegisteredInstanceCommand decorator for the latest supported version',
})
export class GenerateInstanceCommandCommand extends CommandRunner {
  private readonly logger = new Logger(GenerateInstanceCommandCommand.name);

  constructor(
    private readonly instanceMigrationGenerationService: InstanceCommandGenerationService,
  ) {
    super();
  }

  @Option({
    flags: '-n, --name <name>',
    description: 'Migration name (kebab-case)',
    defaultValue: 'auto-generated',
  })
  parseName(value: string): string {
    return value;
  }

  @Option({
    flags: '-t, --type <type>',
    description:
      'Command type: fast (schema diff) or slow (data migration + DDL)',
    defaultValue: 'fast',
  })
  parseType(value: string): InstanceCommandType {
    if (value !== 'fast' && value !== 'slow') {
      throw new Error(`Invalid type "${value}". Must be "fast" or "slow".`);
    }

    return value;
  }

  @Option({
    flags: '--version <version>',
    description: 'Target version (e.g. 1.23.0). Defaults to CURRENT_VERSION.',
  })
  parseVersion(value: string): TwentyAllVersion {
    if (
      !TWENTY_ALL_VERSIONS.includes(
        value as (typeof TWENTY_ALL_VERSIONS)[number],
      )
    ) {
      throw new Error(
        `Invalid version "${value}". Must be one of: ${TWENTY_ALL_VERSIONS.join(', ')}`,
      );
    }

    return value as TwentyAllVersion;
  }

  async run(
    _passedParams: string[],
    options: GenerateInstanceCommandOptions,
  ): Promise<void> {
    const migrationName = options.name;
    const version = options.version ?? TWENTY_CURRENT_VERSION;

    const commandType = options.type;

    this.logger.log(
      `Generating ${commandType} instance command for version ${version}...`,
    );

    const versionDir = this.getVersionDir(version);
    const timestamp = Date.now();

    const result =
      await this.instanceMigrationGenerationService.generateInstanceCommand({
        migrationName,
        version,
        timestamp,
        type: commandType,
      });

    if (!result) {
      this.logger.warn(
        'No changes in database schema were found - cannot generate a migration.',
      );

      return;
    }

    const filePath = path.join(versionDir, result.fileName);

    fs.writeFileSync(filePath, result.fileTemplate);

    this.logger.log(
      `${commandType} instance command generated successfully: ${filePath}`,
    );
    this.logger.log(`  Class: ${result.className}`);
    this.logger.log(`  Version: ${version}`);

    const versionSlug = version.split('.').slice(0, 2).join('-');
    const newImportPath = `src/database/commands/upgrade-version-command/${versionSlug}/${result.fileName.replace('.ts', '')}`;

    this.appendToInstanceCommandsConstant(result.className, newImportPath);
  }

  private getVersionDir(version: string): string {
    const versionSlug = version.split('.').slice(0, 2).join('-');

    return path.join(UPGRADE_VERSION_COMMAND_DIR, versionSlug);
  }

  private appendToInstanceCommandsConstant(
    className: string,
    importPath: string,
  ): void {
    const filePath = path.join(
      UPGRADE_VERSION_COMMAND_DIR,
      'instance-commands.constant.ts',
    );

    const content = fs.readFileSync(filePath, 'utf-8');

    if (content.includes(className)) {
      throw new Error(
        `${className} is already registered in instance-commands.constant.ts`,
      );
    }

    const newImportLine = `import { ${className} } from '${importPath}';\n`;

    const updatedContent = content
      .replace(/\nexport const/, `${newImportLine}\nexport const`)
      .replace(/\];/, `  ${className},\n];`);

    fs.writeFileSync(filePath, updatedContent);

    this.logger.log(`Added ${className} to instance-commands.constant.ts`);
  }
}
