import { Command } from 'nest-commander';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';

@Command({
  name: 'upgrade:0-51:add-updated-by-field',
  description: 'Add updated by field',
})
export class AddUpdatedByFieldCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  override async runOnWorkspace({
    index,
    total,
    workspaceId,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Running command for workspace ${workspaceId} ${index + 1}/${total}`,
    );

    /*    const objectMetadata = await this.objectMetadataRepository.find();

    for (const object of objectMetadata) {
      // Add updatedBy field to object metadata
      // Add logic to update the field values if necessary

      // Example:
      // object.fields.push({
      //   fieldName: 'updatedBy',
      //   fieldType: 'REFERENCE',
      //   referenceTo: 'User',
      // });

      // Save the updated object metadata
      await this.objectMetadataRepository.save({
        ...object,
        updatedBy: object.createdBy,
      });
    }*/
  }
}
