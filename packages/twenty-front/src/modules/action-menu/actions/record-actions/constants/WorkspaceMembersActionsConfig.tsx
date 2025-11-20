import { ActionLink } from '@/action-menu/actions/components/ActionLink';
import { MultipleRecordsActionKeys } from '@/action-menu/actions/record-actions/multiple-records/types/MultipleRecordsActionKeys';
import { NoSelectionRecordActionKeys } from '@/action-menu/actions/record-actions/no-selection/types/NoSelectionRecordActionsKeys';
import { SingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/types/SingleRecordActionsKey';
import { inheritActionsFromDefaultConfig } from '@/action-menu/actions/record-actions/utils/inheritActionsFromDefaultConfig';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { msg } from '@lingui/core/macro';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { IconSettings } from 'twenty-ui/display';

export const WORKSPACE_MEMBERS_ACTIONS_CONFIG = inheritActionsFromDefaultConfig(
  {
    config: {
      [NoSelectionRecordActionKeys.GO_TO_SETTINGS]: {
        type: ActionType.Navigation,
        scope: ActionScope.Global,
        key: NoSelectionRecordActionKeys.GO_TO_SETTINGS,
        label: msg`Manage members in settings`,
        shortLabel: msg`Manage in settings`,
        position: 14,
        Icon: IconSettings,
        isPinned: true,
        availableOn: [
          ActionViewType.INDEX_PAGE_NO_SELECTION,
          ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
          ActionViewType.INDEX_PAGE_BULK_SELECTION,
          ActionViewType.SHOW_PAGE,
        ],
        shouldBeRegistered: () => true,
        component: (
          <ActionLink
            to={AppPath.SettingsCatchAll}
            params={{
              '*': SettingsPath.WorkspaceMembersPage,
            }}
          />
        ),
        hotKeys: ['G', 'S'],
      },
    },
    actionKeys: [
      SingleRecordActionKeys.ADD_TO_FAVORITES,
      SingleRecordActionKeys.REMOVE_FROM_FAVORITES,
      SingleRecordActionKeys.NAVIGATE_TO_PREVIOUS_RECORD,
      SingleRecordActionKeys.NAVIGATE_TO_NEXT_RECORD,
      SingleRecordActionKeys.EXPORT_FROM_RECORD_INDEX,
      SingleRecordActionKeys.EXPORT_FROM_RECORD_SHOW,
      MultipleRecordsActionKeys.EXPORT,
      NoSelectionRecordActionKeys.EXPORT_VIEW,
      NoSelectionRecordActionKeys.SEE_DELETED_RECORDS,
      NoSelectionRecordActionKeys.HIDE_DELETED_RECORDS,
      NoSelectionRecordActionKeys.GO_TO_WORKFLOWS,
      NoSelectionRecordActionKeys.GO_TO_PEOPLE,
      NoSelectionRecordActionKeys.GO_TO_COMPANIES,
      NoSelectionRecordActionKeys.GO_TO_OPPORTUNITIES,
      NoSelectionRecordActionKeys.GO_TO_DASHBOARDS,
      NoSelectionRecordActionKeys.GO_TO_TASKS,
      NoSelectionRecordActionKeys.GO_TO_NOTES,
    ],
    propertiesToOverwrite: {
      [SingleRecordActionKeys.ADD_TO_FAVORITES]: {
        isPinned: false,
        position: 0,
      },
      [SingleRecordActionKeys.REMOVE_FROM_FAVORITES]: {
        isPinned: false,
        position: 1,
      },
      [SingleRecordActionKeys.EXPORT_FROM_RECORD_INDEX]: {
        position: 2,
        label: msg`Export member`,
      },
      [SingleRecordActionKeys.EXPORT_FROM_RECORD_SHOW]: {
        position: 2,
        label: msg`Export member`,
      },
      [MultipleRecordsActionKeys.EXPORT]: {
        position: 3,
        label: msg`Export members`,
      },
      [NoSelectionRecordActionKeys.EXPORT_VIEW]: {
        position: 4,
        label: msg`Export view`,
      },
      [NoSelectionRecordActionKeys.SEE_DELETED_RECORDS]: {
        position: 5,
        label: msg`See deleted members`,
      },
      [NoSelectionRecordActionKeys.HIDE_DELETED_RECORDS]: {
        position: 6,
        label: msg`Hide deleted members`,
      },
      [SingleRecordActionKeys.NAVIGATE_TO_PREVIOUS_RECORD]: {
        position: 7,
      },
      [SingleRecordActionKeys.NAVIGATE_TO_NEXT_RECORD]: {
        position: 8,
      },
      [NoSelectionRecordActionKeys.GO_TO_WORKFLOWS]: {
        position: 9,
      },
      [NoSelectionRecordActionKeys.GO_TO_PEOPLE]: {
        position: 10,
      },
      [NoSelectionRecordActionKeys.GO_TO_COMPANIES]: {
        position: 11,
      },
      [NoSelectionRecordActionKeys.GO_TO_OPPORTUNITIES]: {
        position: 12,
      },
      [NoSelectionRecordActionKeys.GO_TO_DASHBOARDS]: {
        position: 13,
      },
      [NoSelectionRecordActionKeys.GO_TO_TASKS]: {
        position: 15,
      },
      [NoSelectionRecordActionKeys.GO_TO_NOTES]: {
        position: 16,
      },
    },
  },
);
