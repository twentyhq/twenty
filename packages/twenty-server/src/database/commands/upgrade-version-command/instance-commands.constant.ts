// Auto-edited by generate:instance-command — do not edit manually

import { AddViewFieldGroupIdIndexOnViewFieldFastInstanceCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-instance-command-fast-1775129420309-add-view-field-group-id-index-on-view-field';
import { MigrateMessagingCalendarToCoreFastInstanceCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-instance-command-fast-1775165049548-migrate-messaging-calendar-to-core';
import { AddEmailThreadWidgetTypeFastInstanceCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-instance-command-fast-1775200000000-add-email-thread-widget-type';
import { AddPermissionFlagRoleIdIndexFastInstanceCommand } from 'src/database/commands/upgrade-version-command/1-22/1-22-instance-command-fast-1775749486425-add-permission-flag-role-id-index';
import { AddWorkspaceIdToIndirectEntitiesFastInstanceCommand } from 'src/database/commands/upgrade-version-command/1-22/1-22-instance-command-fast-1775758621017-add-workspace-id-to-indirect-entities';
import { BackfillWorkspaceIdOnIndirectEntitiesSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/1-22/1-22-instance-command-slow-1775758621018-backfill-workspace-id-on-indirect-entities';
import { AddWorkspaceIdIndexesAndFksFastInstanceCommand } from 'src/database/commands/upgrade-version-command/1-22/1-22-instance-command-fast-1775761294897-add-workspace-id-indexes-and-fks-to-indirect-entities';

export const INSTANCE_COMMANDS = [
  AddViewFieldGroupIdIndexOnViewFieldFastInstanceCommand,
  MigrateMessagingCalendarToCoreFastInstanceCommand,
  AddEmailThreadWidgetTypeFastInstanceCommand,
  AddPermissionFlagRoleIdIndexFastInstanceCommand,
  AddWorkspaceIdToIndirectEntitiesFastInstanceCommand,
  BackfillWorkspaceIdOnIndirectEntitiesSlowInstanceCommand,
  AddWorkspaceIdIndexesAndFksFastInstanceCommand,
];
