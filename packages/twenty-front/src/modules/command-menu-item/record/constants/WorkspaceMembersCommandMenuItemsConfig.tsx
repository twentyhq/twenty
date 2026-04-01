import { CommandLink } from '@/command-menu-item/display/components/CommandLink';
import { NoSelectionRecordCommandKeys } from '@/command-menu-item/record/no-selection/types/NoSelectionRecordCommandKeys';
import { SingleRecordCommandKeys } from '@/command-menu-item/record/single-record/types/SingleRecordCommandKeys';
import { RecordCommandKeys } from '@/command-menu-item/record/types/RecordCommandKeys';
import { inheritCommandMenuItemsFromDefaultConfig } from '@/command-menu-item/record/utils/inheritCommandMenuItemsFromDefaultConfig';
import { CommandMenuItemScope } from '@/command-menu-item/types/CommandMenuItemScope';
import { CommandMenuItemType } from '@/command-menu-item/types/CommandMenuItemType';
import {
  CommandMenuItemViewType,
  AppPath,
  SettingsPath,
} from 'twenty-shared/types';
import { msg } from '@lingui/core/macro';
import { IconSettings } from 'twenty-ui/display';

export const WORKSPACE_MEMBERS_COMMAND_MENU_ITEMS_CONFIG =
  inheritCommandMenuItemsFromDefaultConfig({
    config: {
      [NoSelectionRecordCommandKeys.GO_TO_SETTINGS]: {
        type: CommandMenuItemType.Navigation,
        scope: CommandMenuItemScope.Global,
        key: NoSelectionRecordCommandKeys.GO_TO_SETTINGS,
        label: msg`Manage members in settings`,
        shortLabel: msg`Manage in settings`,
        position: 14,
        Icon: IconSettings,
        isPinned: true,
        availableOn: [
          CommandMenuItemViewType.INDEX_PAGE_NO_SELECTION,
          CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
          CommandMenuItemViewType.INDEX_PAGE_BULK_SELECTION,
          CommandMenuItemViewType.SHOW_PAGE,
        ],
        shouldBeRegistered: () => true,
        component: (
          <CommandLink
            to={AppPath.SettingsCatchAll}
            params={{
              '*': SettingsPath.WorkspaceMembersPage,
            }}
          />
        ),
        hotKeys: ['G', 'S'],
      },
    },
    commandKeys: [
      SingleRecordCommandKeys.ADD_TO_FAVORITES,
      SingleRecordCommandKeys.REMOVE_FROM_FAVORITES,
      SingleRecordCommandKeys.NAVIGATE_TO_PREVIOUS_RECORD,
      SingleRecordCommandKeys.NAVIGATE_TO_NEXT_RECORD,
      RecordCommandKeys.EXPORT,
      NoSelectionRecordCommandKeys.EXPORT_VIEW,
      NoSelectionRecordCommandKeys.SEE_DELETED_RECORDS,
      NoSelectionRecordCommandKeys.HIDE_DELETED_RECORDS,
      NoSelectionRecordCommandKeys.GO_TO_WORKFLOWS,
      NoSelectionRecordCommandKeys.GO_TO_PEOPLE,
      NoSelectionRecordCommandKeys.GO_TO_COMPANIES,
      NoSelectionRecordCommandKeys.GO_TO_OPPORTUNITIES,
      NoSelectionRecordCommandKeys.GO_TO_DASHBOARDS,
      NoSelectionRecordCommandKeys.GO_TO_TASKS,
      NoSelectionRecordCommandKeys.GO_TO_NOTES,
    ],
    propertiesToOverwrite: {
      [SingleRecordCommandKeys.ADD_TO_FAVORITES]: {
        isPinned: false,
        position: 0,
      },
      [SingleRecordCommandKeys.REMOVE_FROM_FAVORITES]: {
        isPinned: false,
        position: 1,
      },
      [RecordCommandKeys.EXPORT]: {
        position: 2,
        label: msg`Export members`,
      },
      [NoSelectionRecordCommandKeys.EXPORT_VIEW]: {
        position: 4,
        label: msg`Export view`,
      },
      [NoSelectionRecordCommandKeys.SEE_DELETED_RECORDS]: {
        position: 5,
        label: msg`See deleted members`,
      },
      [NoSelectionRecordCommandKeys.HIDE_DELETED_RECORDS]: {
        position: 6,
        label: msg`Hide deleted members`,
      },
      [SingleRecordCommandKeys.NAVIGATE_TO_PREVIOUS_RECORD]: {
        position: 7,
      },
      [SingleRecordCommandKeys.NAVIGATE_TO_NEXT_RECORD]: {
        position: 8,
      },
      [NoSelectionRecordCommandKeys.GO_TO_WORKFLOWS]: {
        position: 9,
      },
      [NoSelectionRecordCommandKeys.GO_TO_PEOPLE]: {
        position: 10,
      },
      [NoSelectionRecordCommandKeys.GO_TO_COMPANIES]: {
        position: 11,
      },
      [NoSelectionRecordCommandKeys.GO_TO_OPPORTUNITIES]: {
        position: 12,
      },
      [NoSelectionRecordCommandKeys.GO_TO_DASHBOARDS]: {
        position: 13,
      },
      [NoSelectionRecordCommandKeys.GO_TO_TASKS]: {
        position: 15,
      },
      [NoSelectionRecordCommandKeys.GO_TO_NOTES]: {
        position: 16,
      },
    },
  });
