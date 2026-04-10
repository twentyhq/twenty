// Auto-edited by generate:instance-command — do not edit manually

import { AddViewFieldGroupIdIndexOnViewFieldFastInstanceCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-instance-command-fast-1775129420309-add-view-field-group-id-index-on-view-field';
import { MigrateMessagingCalendarToCoreFastInstanceCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-instance-command-fast-1775165049548-migrate-messaging-calendar-to-core';
import { AddEmailThreadWidgetTypeFastInstanceCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-instance-command-fast-1775200000000-add-email-thread-widget-type';
import { AddTableWidgetViewTypeFastInstanceCommand } from 'src/database/commands/upgrade-version-command/1-22/1-22-instance-command-fast-1775752190522-add-table-widget-view-type';

export const INSTANCE_COMMANDS = [
  AddViewFieldGroupIdIndexOnViewFieldFastInstanceCommand,
  MigrateMessagingCalendarToCoreFastInstanceCommand,
  AddEmailThreadWidgetTypeFastInstanceCommand,
  AddTableWidgetViewTypeFastInstanceCommand,
];
