import { Command, CommandRunner, Option } from 'nest-commander';

import { FixObjectMetadataIdStandardIdCommand } from 'src/database/commands/upgrade-version/0-22/0-22-fix-object-metadata-id-standard-id.command';
import { UpdateBooleanFieldsNullDefaultValuesAndNullValuesCommand } from 'src/database/commands/upgrade-version/0-22/0-22-update-boolean-fields-null-default-values-and-null-values.command';

interface UpdateBooleanFieldsNullDefaultValuesAndNullValuesCommandOptions {
  workspaceId?: string;
}

@Command({
  name: 'upgrade-0.22',
  description: 'Upgrade to 0.22',
})
export class UpgradeTo0_22Command extends CommandRunner {
  constructor(
    private readonly fixObjectMetadataIdStandardIdCommand: FixObjectMetadataIdStandardIdCommand,
    private readonly updateBooleanFieldsNullDefaultValuesAndNullValuesCommand: UpdateBooleanFieldsNullDefaultValuesAndNullValuesCommand,
  ) {
    super();
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description: 'workspace id. Command runs on all workspaces if not provided',
    required: false,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  async run(
    _passedParam: string[],
    options: UpdateBooleanFieldsNullDefaultValuesAndNullValuesCommandOptions,
  ): Promise<void> {
    await this.fixObjectMetadataIdStandardIdCommand.run(_passedParam, options);
    await this.updateBooleanFieldsNullDefaultValuesAndNullValuesCommand.run(
      _passedParam,
      options,
    );
  }
}
