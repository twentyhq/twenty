import { Command, CommandRunner, Option } from 'nest-commander';

import { AddNewAddressFieldToViewsWithDeprecatedAddressFieldCommand } from 'src/database/commands/upgrade-version/0-22/0-22-add-new-address-field-to-views-with-deprecated-address.command';
import { FixObjectMetadataIdStandardIdCommand } from 'src/database/commands/upgrade-version/0-22/0-22-fix-object-metadata-id-standard-id.command';
import { UpdateBooleanFieldsNullDefaultValuesAndNullValuesCommand } from 'src/database/commands/upgrade-version/0-22/0-22-update-boolean-fields-null-default-values-and-null-values.command';
import { UpdateMessageChannelSyncStageEnumCommand } from 'src/database/commands/upgrade-version/0-22/0-22-update-message-channel-sync-stage-enum.command';
import { UpdateMessageChannelSyncStatusEnumCommand } from 'src/database/commands/upgrade-version/0-22/0-22-update-message-channel-sync-status-enum.command';

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
    private readonly addNewAddressFieldToViewsWithDeprecatedAddressFieldCommand: AddNewAddressFieldToViewsWithDeprecatedAddressFieldCommand,
    private readonly updateMessageChannelSyncStatusEnumCommand: UpdateMessageChannelSyncStatusEnumCommand,
    private readonly updateMessageChannelSyncStageEnumCommand: UpdateMessageChannelSyncStageEnumCommand,
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
    await this.addNewAddressFieldToViewsWithDeprecatedAddressFieldCommand.run(
      _passedParam,
      options,
    );
    await this.updateMessageChannelSyncStatusEnumCommand.run(
      _passedParam,
      options,
    );
    await this.updateMessageChannelSyncStageEnumCommand.run(
      _passedParam,
      options,
    );
  }
}
