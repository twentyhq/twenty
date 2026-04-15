// Auto-edited by generate:instance-command — do not edit manually

import { AddViewFieldGroupIdIndexOnViewFieldFastInstanceCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-instance-command-fast-1775129420309-add-view-field-group-id-index-on-view-field';
import { MigrateMessagingCalendarToCoreFastInstanceCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-instance-command-fast-1775165049548-migrate-messaging-calendar-to-core';
import { AddEmailThreadWidgetTypeFastInstanceCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-instance-command-fast-1775200000000-add-email-thread-widget-type';
import { AddStandalonePageFastInstanceCommand } from 'src/database/commands/upgrade-version-command/1-23/1-23-instance-command-fast-1775752781995-add-standalone-page';
import { AddPermissionFlagRoleIdIndexFastInstanceCommand } from 'src/database/commands/upgrade-version-command/1-22/1-22-instance-command-fast-1775749486425-add-permission-flag-role-id-index';
import { AddTableWidgetViewTypeFastInstanceCommand } from 'src/database/commands/upgrade-version-command/1-22/1-22-instance-command-fast-1775752190522-add-table-widget-view-type';
import { AddWorkspaceIdToIndirectEntitiesFastInstanceCommand } from 'src/database/commands/upgrade-version-command/1-22/1-22-instance-command-fast-1775758621017-add-workspace-id-to-indirect-entities';
import { AddWorkspaceIdIndexesAndFksFastInstanceCommand } from 'src/database/commands/upgrade-version-command/1-22/1-22-instance-command-fast-1775761294897-add-workspace-id-indexes-and-fks-to-indirect-entities';
import { DropObjectMetadataDataSourceFkFastInstanceCommand } from 'src/database/commands/upgrade-version-command/1-22/1-22-instance-command-fast-1775804361516-drop-object-metadata-data-source-fk';
import { AddCreditBalanceToBillingCustomerFastInstanceCommand } from 'src/database/commands/upgrade-version-command/1-22/1-22-instance-command-fast-1776078919203-add-credit-balance-to-billing-customer';
import { BackfillWorkspaceIdOnIndirectEntitiesSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/1-22/1-22-instance-command-slow-1775758621018-backfill-workspace-id-on-indirect-entities';
import { DropWorkspaceVersionColumnFastInstanceCommand } from 'src/database/commands/upgrade-version-command/1-23/1-23-instance-command-fast-1785000000000-drop-workspace-version-column';
import { AddGlobalObjectContextToCommandMenuItemAvailabilityTypeFastInstanceCommand } from 'src/database/commands/upgrade-version-command/1-23/1-23-instance-command-fast-1776090711153-add-global-object-context-to-command-menu-item-availability-type';

export const INSTANCE_COMMANDS = [
  AddViewFieldGroupIdIndexOnViewFieldFastInstanceCommand,
  MigrateMessagingCalendarToCoreFastInstanceCommand,
  AddEmailThreadWidgetTypeFastInstanceCommand,
  AddTableWidgetViewTypeFastInstanceCommand,
  AddStandalonePageFastInstanceCommand,
  AddPermissionFlagRoleIdIndexFastInstanceCommand,
  AddWorkspaceIdToIndirectEntitiesFastInstanceCommand,
  BackfillWorkspaceIdOnIndirectEntitiesSlowInstanceCommand,
  AddWorkspaceIdIndexesAndFksFastInstanceCommand,
  DropObjectMetadataDataSourceFkFastInstanceCommand,
  AddCreditBalanceToBillingCustomerFastInstanceCommand,
  DropWorkspaceVersionColumnFastInstanceCommand,
  AddGlobalObjectContextToCommandMenuItemAvailabilityTypeFastInstanceCommand,
];
