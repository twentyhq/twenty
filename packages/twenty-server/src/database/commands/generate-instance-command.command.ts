import * as fs from 'fs';
import * as path from 'path';

import { Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';

import { InstanceCommandGenerationService } from 'src/database/commands/instance-command-generation.service';
import { UPGRADE_COMMAND_SUPPORTED_VERSIONS } from 'src/engine/constants/upgrade-command-supported-versions.constant';

const UPGRADE_VERSION_COMMAND_DIR = path.resolve(
  process.cwd(),
  'src/database/commands/upgrade-version-command',
);

type GenerateInstanceCommandOptions = {
  name: string;
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

  async run(
    _passedParams: string[],
    options: GenerateInstanceCommandOptions,
  ): Promise<void> {
    const migrationName = options.name;

    const version = UPGRADE_COMMAND_SUPPORTED_VERSIONS.slice(-1)[0];

    if (!version) {
      throw new Error('No supported versions found');
    }

    this.logger.log(`Generating versioned migration for version ${version}...`);

    const versionDir = this.getVersionDir(version);
    const timestamp = Date.now();

    const result = await this.instanceMigrationGenerationService.generate({
      migrationName,
      version,
      timestamp,
    });

    if (!result) {
      this.logger.warn(
        'No changes in database schema were found - cannot generate a migration.',
      );

      return;
    }

    const migrationFilePath = path.join(versionDir, result.fileName);

    fs.writeFileSync(migrationFilePath, result.fileTemplate);

    this.logger.log(`Migration generated successfully: ${migrationFilePath}`);
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
