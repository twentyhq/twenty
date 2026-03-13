import { MultipleRecordsCommandKeys } from '@/command-menu-item/record/multiple-records/types/MultipleRecordsCommandKeys';
import { NoSelectionRecordCommandKeys } from '@/command-menu-item/record/no-selection/types/NoSelectionRecordCommandKeys';
import { CancelDashboardSingleRecordCommand } from '@/command-menu-item/record/single-record/dashboard/components/CancelDashboardSingleRecordCommand';
import { DuplicateDashboardSingleRecordCommand } from '@/command-menu-item/record/single-record/dashboard/components/DuplicateDashboardSingleRecordCommand';
import { EditDashboardSingleRecordCommand } from '@/command-menu-item/record/single-record/dashboard/components/EditDashboardSingleRecordCommand';
import { SaveDashboardSingleRecordCommand } from '@/command-menu-item/record/single-record/dashboard/components/SaveDashboardSingleRecordCommand';
import { DashboardSingleRecordCommandKeys } from '@/command-menu-item/record/single-record/dashboard/types/DashboardSingleRecordCommandKeys';
import { SingleRecordCommandKeys } from '@/command-menu-item/record/single-record/types/SingleRecordCommandKeys';
import { inheritCommandMenuItemsFromDefaultConfig } from '@/command-menu-item/record/utils/inheritCommandMenuItemsFromDefaultConfig';
import { CommandMenuItemScope } from '@/command-menu-item/types/CommandMenuItemScope';
import { CommandMenuItemType } from '@/command-menu-item/types/CommandMenuItemType';
import { CommandMenuItemViewType } from 'twenty-shared/types';
import { PageLayoutSingleRecordActionKeys } from '@/page-layout/actions/PageLayoutSingleRecordActionKeys';
import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  IconCancel,
  IconCopyPlus,
  IconDeviceFloppy,
  IconPencil,
} from 'twenty-ui/display';

export const DASHBOARD_COMMAND_MENU_ITEMS_CONFIG =
  inheritCommandMenuItemsFromDefaultConfig({
    config: {
      [PageLayoutSingleRecordActionKeys.EDIT_LAYOUT]: {
        key: PageLayoutSingleRecordActionKeys.EDIT_LAYOUT,
        label: msg`Edit Dashboard`,
        shortLabel: msg`Edit`,
        isPinned: true,
        position: 3,
        Icon: IconPencil,
        type: CommandMenuItemType.Standard,
        scope: CommandMenuItemScope.RecordSelection,
        shouldBeRegistered: ({ selectedRecord, objectPermissions }) =>
          isDefined(selectedRecord) &&
          !selectedRecord?.isRemote &&
          !isDefined(selectedRecord?.deletedAt) &&
          isDefined(selectedRecord?.pageLayoutId) &&
          objectPermissions.canUpdateObjectRecords,
        availableOn: [CommandMenuItemViewType.SHOW_PAGE],
        component: <EditDashboardSingleRecordCommand />,
      },
      [PageLayoutSingleRecordActionKeys.SAVE_LAYOUT]: {
        key: PageLayoutSingleRecordActionKeys.SAVE_LAYOUT,
        label: msg`Save Dashboard`,
        shortLabel: msg`Save`,
        isPinned: true,
        isPrimaryCTA: true,
        position: 4,
        Icon: IconDeviceFloppy,
        type: CommandMenuItemType.Standard,
        scope: CommandMenuItemScope.RecordSelection,
        shouldBeRegistered: ({ selectedRecord, objectPermissions }) =>
          isDefined(selectedRecord) &&
          !selectedRecord?.isRemote &&
          !isDefined(selectedRecord?.deletedAt) &&
          isDefined(selectedRecord?.pageLayoutId) &&
          objectPermissions.canUpdateObjectRecords,
        availableOn: [CommandMenuItemViewType.PAGE_EDIT_MODE],
        component: <SaveDashboardSingleRecordCommand />,
      },
      [PageLayoutSingleRecordActionKeys.CANCEL_LAYOUT_EDITION]: {
        key: PageLayoutSingleRecordActionKeys.CANCEL_LAYOUT_EDITION,
        label: msg`Cancel Edition`,
        shortLabel: msg`Cancel`,
        isPinned: true,
        position: 5,
        Icon: IconCancel,
        type: CommandMenuItemType.Standard,
        scope: CommandMenuItemScope.RecordSelection,
        shouldBeRegistered: ({ selectedRecord, objectPermissions }) =>
          isDefined(selectedRecord) &&
          !selectedRecord?.isRemote &&
          !isDefined(selectedRecord?.deletedAt) &&
          isDefined(selectedRecord?.pageLayoutId) &&
          objectPermissions.canUpdateObjectRecords,
        availableOn: [CommandMenuItemViewType.PAGE_EDIT_MODE],
        component: <CancelDashboardSingleRecordCommand />,
      },
      [DashboardSingleRecordCommandKeys.DUPLICATE_DASHBOARD]: {
        key: DashboardSingleRecordCommandKeys.DUPLICATE_DASHBOARD,
        label: msg`Duplicate Dashboard`,
        shortLabel: msg`Duplicate`,
        isPinned: false,
        position: 6,
        Icon: IconCopyPlus,
        type: CommandMenuItemType.Standard,
        scope: CommandMenuItemScope.RecordSelection,
        shouldBeRegistered: ({ selectedRecord, objectPermissions }) =>
          isDefined(selectedRecord) &&
          !selectedRecord?.isRemote &&
          !isDefined(selectedRecord?.deletedAt) &&
          objectPermissions.canUpdateObjectRecords,
        availableOn: [
          CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
          CommandMenuItemViewType.SHOW_PAGE,
        ],
        component: <DuplicateDashboardSingleRecordCommand />,
      },
    },
    commandKeys: [
      NoSelectionRecordCommandKeys.CREATE_NEW_RECORD,
      SingleRecordCommandKeys.ADD_TO_FAVORITES,
      SingleRecordCommandKeys.REMOVE_FROM_FAVORITES,
      SingleRecordCommandKeys.DELETE,
      SingleRecordCommandKeys.DESTROY,
      SingleRecordCommandKeys.RESTORE,
      MultipleRecordsCommandKeys.DELETE,
      MultipleRecordsCommandKeys.DESTROY,
      MultipleRecordsCommandKeys.RESTORE,
      NoSelectionRecordCommandKeys.SEE_DELETED_RECORDS,
      NoSelectionRecordCommandKeys.HIDE_DELETED_RECORDS,
      SingleRecordCommandKeys.EXPORT_FROM_RECORD_SHOW,
      SingleRecordCommandKeys.NAVIGATE_TO_PREVIOUS_RECORD,
      SingleRecordCommandKeys.NAVIGATE_TO_NEXT_RECORD,
      NoSelectionRecordCommandKeys.GO_TO_WORKFLOWS,
      NoSelectionRecordCommandKeys.GO_TO_PEOPLE,
      NoSelectionRecordCommandKeys.GO_TO_COMPANIES,
      NoSelectionRecordCommandKeys.GO_TO_OPPORTUNITIES,
      NoSelectionRecordCommandKeys.GO_TO_SETTINGS,
      NoSelectionRecordCommandKeys.GO_TO_TASKS,
      NoSelectionRecordCommandKeys.GO_TO_NOTES,
    ],
    propertiesToOverwrite: {
      [SingleRecordCommandKeys.NAVIGATE_TO_NEXT_RECORD]: {
        position: 0,
        label: msg`Navigate to next dashboard`,
      },
      [SingleRecordCommandKeys.NAVIGATE_TO_PREVIOUS_RECORD]: {
        position: 1,
        label: msg`Navigate to previous dashboard`,
      },
      [NoSelectionRecordCommandKeys.CREATE_NEW_RECORD]: {
        position: 2,
        label: msg`Create new dashboard`,
      },
      [SingleRecordCommandKeys.DELETE]: {
        position: 7,
        label: msg`Delete dashboard`,
      },
      [MultipleRecordsCommandKeys.DELETE]: {
        position: 12,
        label: msg`Delete dashboards`,
      },
      [SingleRecordCommandKeys.ADD_TO_FAVORITES]: {
        position: 8,
        isPinned: true,
      },
      [SingleRecordCommandKeys.REMOVE_FROM_FAVORITES]: {
        position: 9,
        isPinned: true,
      },
      [SingleRecordCommandKeys.EXPORT_FROM_RECORD_SHOW]: {
        position: 10,
        label: msg`Export dashboard`,
      },
      [SingleRecordCommandKeys.DESTROY]: {
        position: 11,
        label: msg`Permanently destroy dashboard`,
      },
      [MultipleRecordsCommandKeys.DESTROY]: {
        position: 13,
        label: msg`Permanently destroy dashboards`,
      },
      [SingleRecordCommandKeys.RESTORE]: {
        position: 14,
        label: msg`Restore dashboard`,
      },
      [MultipleRecordsCommandKeys.RESTORE]: {
        position: 15,
        label: msg`Restore dashboards`,
      },
      [NoSelectionRecordCommandKeys.SEE_DELETED_RECORDS]: {
        position: 22,
        label: msg`See deleted dashboards`,
      },
      [NoSelectionRecordCommandKeys.HIDE_DELETED_RECORDS]: {
        position: 23,
        label: msg`Hide deleted dashboards`,
      },
      [NoSelectionRecordCommandKeys.GO_TO_WORKFLOWS]: {
        position: 24,
      },
      [NoSelectionRecordCommandKeys.GO_TO_PEOPLE]: {
        position: 25,
      },
      [NoSelectionRecordCommandKeys.GO_TO_COMPANIES]: {
        position: 26,
      },
      [NoSelectionRecordCommandKeys.GO_TO_OPPORTUNITIES]: {
        position: 27,
      },
      [NoSelectionRecordCommandKeys.GO_TO_SETTINGS]: {
        position: 28,
      },
      [NoSelectionRecordCommandKeys.GO_TO_TASKS]: {
        position: 29,
      },
      [NoSelectionRecordCommandKeys.GO_TO_NOTES]: {
        position: 30,
      },
    },
  });
