import { NoSelectionRecordActionKeys } from '@/action-menu/actions/record-actions/no-selection/types/NoSelectionRecordActionsKeys';
import { CancelDashboardSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/dashboard-actions/components/CancelDashboardSingleRecordAction';
import { EditDashboardSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/dashboard-actions/components/EditDashboardSingleRecordAction';
import { SaveDashboardSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/dashboard-actions/components/SaveDashboardSingleRecordAction';
import { SingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/types/SingleRecordActionsKey';
import { inheritActionsFromDefaultConfig } from '@/action-menu/actions/record-actions/utils/inheritActionsFromDefaultConfig';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { PageLayoutSingleRecordActionKeys } from '@/page-layout/actions/PageLayoutSingleRecordActionKeys';
import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconDeviceFloppy, IconPencil, IconX } from 'twenty-ui/display';

export const DASHBOARD_ACTIONS_CONFIG = inheritActionsFromDefaultConfig({
  config: {
    [PageLayoutSingleRecordActionKeys.EDIT_LAYOUT]: {
      key: PageLayoutSingleRecordActionKeys.EDIT_LAYOUT,
      label: msg`Edit Dashboard`,
      shortLabel: msg`Edit`,
      isPinned: true,
      position: 2,
      Icon: IconPencil,
      type: ActionType.Standard,
      scope: ActionScope.RecordSelection,
      shouldBeRegistered: ({ selectedRecord }) =>
        isDefined(selectedRecord) &&
        !selectedRecord?.isRemote &&
        !isDefined(selectedRecord?.deletedAt) &&
        isDefined(selectedRecord?.pageLayoutId),
      availableOn: [ActionViewType.SHOW_PAGE],
      component: <EditDashboardSingleRecordAction />,
    },
    [PageLayoutSingleRecordActionKeys.SAVE_LAYOUT]: {
      key: PageLayoutSingleRecordActionKeys.SAVE_LAYOUT,
      label: msg`Save Dashboard`,
      shortLabel: msg`Save`,
      isPinned: true,
      isPrimaryCTA: true,
      position: 3,
      Icon: IconDeviceFloppy,
      type: ActionType.Standard,
      scope: ActionScope.RecordSelection,
      shouldBeRegistered: ({ selectedRecord }) =>
        isDefined(selectedRecord) &&
        !selectedRecord?.isRemote &&
        !isDefined(selectedRecord?.deletedAt) &&
        isDefined(selectedRecord?.pageLayoutId),
      availableOn: [ActionViewType.FULL_TAB_WIDGET_EDIT_MODE],
      component: <SaveDashboardSingleRecordAction />,
    },
    [PageLayoutSingleRecordActionKeys.CANCEL_LAYOUT_EDITION]: {
      key: PageLayoutSingleRecordActionKeys.CANCEL_LAYOUT_EDITION,
      label: msg`Cancel Edition`,
      shortLabel: msg`Cancel`,
      isPinned: true,
      position: 4,
      Icon: IconX,
      type: ActionType.Standard,
      scope: ActionScope.RecordSelection,
      shouldBeRegistered: ({ selectedRecord }) =>
        isDefined(selectedRecord) &&
        !selectedRecord?.isRemote &&
        !isDefined(selectedRecord?.deletedAt) &&
        isDefined(selectedRecord?.pageLayoutId),
      availableOn: [ActionViewType.FULL_TAB_WIDGET_EDIT_MODE],
      component: <CancelDashboardSingleRecordAction />,
    },
  },
  actionKeys: [
    NoSelectionRecordActionKeys.CREATE_NEW_RECORD,
    SingleRecordActionKeys.ADD_TO_FAVORITES,
    SingleRecordActionKeys.REMOVE_FROM_FAVORITES,
    SingleRecordActionKeys.DELETE,
    SingleRecordActionKeys.DESTROY,
    SingleRecordActionKeys.RESTORE,
    SingleRecordActionKeys.EXPORT_FROM_RECORD_SHOW,
    SingleRecordActionKeys.NAVIGATE_TO_PREVIOUS_RECORD,
    SingleRecordActionKeys.NAVIGATE_TO_NEXT_RECORD,
    NoSelectionRecordActionKeys.GO_TO_WORKFLOWS,
    NoSelectionRecordActionKeys.GO_TO_PEOPLE,
    NoSelectionRecordActionKeys.GO_TO_COMPANIES,
    NoSelectionRecordActionKeys.GO_TO_OPPORTUNITIES,
    NoSelectionRecordActionKeys.GO_TO_SETTINGS,
    NoSelectionRecordActionKeys.GO_TO_TASKS,
    NoSelectionRecordActionKeys.GO_TO_NOTES,
  ],
  propertiesToOverwrite: {
    [SingleRecordActionKeys.NAVIGATE_TO_NEXT_RECORD]: {
      position: 0,
      label: msg`Navigate to next dashboard`,
    },
    [SingleRecordActionKeys.NAVIGATE_TO_PREVIOUS_RECORD]: {
      position: 1,
      label: msg`Navigate to previous dashboard`,
    },
    [NoSelectionRecordActionKeys.CREATE_NEW_RECORD]: {
      position: 0,
      label: msg`Create new dashboard`,
    },
    [SingleRecordActionKeys.DELETE]: {
      position: 5,
      label: msg`Delete dashboard`,
    },
    [SingleRecordActionKeys.ADD_TO_FAVORITES]: {
      position: 6,
      isPinned: true,
    },
    [SingleRecordActionKeys.REMOVE_FROM_FAVORITES]: {
      position: 7,
      isPinned: true,
    },
    [SingleRecordActionKeys.EXPORT_FROM_RECORD_SHOW]: {
      position: 8,
      label: msg`Export dashboard`,
    },
    [SingleRecordActionKeys.DESTROY]: {
      position: 9,
      label: msg`Permanently destroy dashboard`,
    },
    [SingleRecordActionKeys.RESTORE]: {
      position: 10,
      label: msg`Restore dashboard`,
    },
    [NoSelectionRecordActionKeys.GO_TO_WORKFLOWS]: {
      position: 11,
    },
    [NoSelectionRecordActionKeys.GO_TO_PEOPLE]: {
      position: 12,
    },
    [NoSelectionRecordActionKeys.GO_TO_COMPANIES]: {
      position: 13,
    },
    [NoSelectionRecordActionKeys.GO_TO_OPPORTUNITIES]: {
      position: 14,
    },
    [NoSelectionRecordActionKeys.GO_TO_SETTINGS]: {
      position: 15,
    },
    [NoSelectionRecordActionKeys.GO_TO_TASKS]: {
      position: 16,
    },
    [NoSelectionRecordActionKeys.GO_TO_NOTES]: {
      position: 17,
    },
  },
});
