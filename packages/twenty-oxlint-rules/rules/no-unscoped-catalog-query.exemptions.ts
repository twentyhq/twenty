const FROZEN_UPGRADE_COMMAND_REASON =
  'Already-released upgrade command: CI forbids editing committed command logic';

export const NO_UNSCOPED_CATALOG_QUERY_EXEMPTIONS: {
  filePath: string;
  reason: string;
}[] = [
  {
    filePath:
      'src/database/commands/upgrade-version-command/2-55/2-55-workspace-command-1793391296027-add-access-group-storage-columns.command.ts',
    reason: FROZEN_UPGRADE_COMMAND_REASON,
  },
  {
    filePath:
      'src/database/commands/upgrade-version-command/2-55/2-55-workspace-command-1793436309311-add-private-record-column.command.ts',
    reason: FROZEN_UPGRADE_COMMAND_REASON,
  },
  {
    filePath:
      'src/database/commands/upgrade-version-command/2-55/2-55-workspace-command-1793457458179-make-restricted-records-private.command.ts',
    reason: FROZEN_UPGRADE_COMMAND_REASON,
  },
  {
    filePath:
      'src/database/commands/upgrade-version-command/2-55/2-55-workspace-command-1793460623155-make-chat-threads-private-records.command.ts',
    reason: FROZEN_UPGRADE_COMMAND_REASON,
  },
  {
    filePath:
      'src/database/commands/upgrade-version-command/2-63/2-63-workspace-command-1795470090382-add-rich-text-file-ids-columns.command.ts',
    reason: FROZEN_UPGRADE_COMMAND_REASON,
  },
  {
    filePath:
      'src/database/commands/upgrade-version-command/2-65/2-65-workspace-command-1795707939505-provision-rich-text-files-columns.command.ts',
    reason: FROZEN_UPGRADE_COMMAND_REASON,
  },
  {
    filePath:
      'src/engine/core-modules/admin-panel/indicators/database.health.ts',
    reason:
      'Instance-wide table statistics, read on demand from the admin panel only',
  },
  {
    filePath:
      'src/engine/metadata-modules/object-metadata/object-record-count.service.ts',
    reason:
      'Known offender, to be scoped with relname = ANY(...); remove this entry with the fix',
  },
];
