import { NoSelectionRecordActionKeys } from '@/action-menu/actions/record-actions/no-selection/types/NoSelectionRecordActionsKeys';
import { AddToFavoritesSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/components/AddToFavoritesSingleRecordAction';
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
import {
  IconDeviceFloppy,
  IconHeart,
  IconPencil,
  IconX,
} from 'twenty-ui/display';

export const DASHBOARD_ACTIONS_CONFIG = inheritActionsFromDefaultConfig({
  config: {
    [PageLayoutSingleRecordActionKeys.ADD_TO_FAVORITES_READ_MODE]: {
      key: PageLayoutSingleRecordActionKeys.ADD_TO_FAVORITES_READ_MODE,
      label: msg`Add to favorites`,
      shortLabel: msg`Add to favorites`,
      isPinned: true,
      position: 0,
      Icon: IconHeart,
      type: ActionType.Standard,
      scope: ActionScope.RecordSelection,
      shouldBeRegistered: ({ selectedRecord }) =>
        isDefined(selectedRecord) &&
        !selectedRecord?.isRemote &&
        !isDefined(selectedRecord?.deletedAt),
      availableOn: [ActionViewType.SHOW_PAGE],
      component: <AddToFavoritesSingleRecordAction />,
    },
    [PageLayoutSingleRecordActionKeys.EDIT_LAYOUT]: {
      key: PageLayoutSingleRecordActionKeys.EDIT_LAYOUT,
      label: msg`Edit Dashboard`,
      shortLabel: msg`Edit`,
      isPinned: true,
      position: 1,
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
    [PageLayoutSingleRecordActionKeys.CANCEL_LAYOUT_EDITION]: {
      key: PageLayoutSingleRecordActionKeys.CANCEL_LAYOUT_EDITION,
      label: msg`Cancel Edition`,
      shortLabel: msg`Cancel`,
      isPinned: true,
      position: 0,
      Icon: IconX,
      type: ActionType.Standard,
      scope: ActionScope.RecordSelection,
      shouldBeRegistered: ({ selectedRecord }) =>
        isDefined(selectedRecord) &&
        !selectedRecord?.isRemote &&
        !isDefined(selectedRecord?.deletedAt) &&
        isDefined(selectedRecord?.pageLayoutId),
      availableOn: [ActionViewType.SHOW_PAGE],
      component: <CancelDashboardSingleRecordAction />,
    },
    [PageLayoutSingleRecordActionKeys.SAVE_LAYOUT]: {
      key: PageLayoutSingleRecordActionKeys.SAVE_LAYOUT,
      label: msg`Save Dashboard`,
      shortLabel: msg`Save`,
      isPinned: true,
      position: 1,
      Icon: IconDeviceFloppy,
      type: ActionType.Standard,
      scope: ActionScope.RecordSelection,
      shouldBeRegistered: ({ selectedRecord }) =>
        isDefined(selectedRecord) &&
        !selectedRecord?.isRemote &&
        !isDefined(selectedRecord?.deletedAt) &&
        isDefined(selectedRecord?.pageLayoutId),
      availableOn: [ActionViewType.SHOW_PAGE],
      component: <SaveDashboardSingleRecordAction />,
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
    [NoSelectionRecordActionKeys.CREATE_NEW_RECORD]: {
      position: 0,
      label: msg`Create new dashboard`,
    },
    [SingleRecordActionKeys.ADD_TO_FAVORITES]: {
      position: 3,
      isPinned: false,
    },
    [SingleRecordActionKeys.REMOVE_FROM_FAVORITES]: {
      position: 4,
    },
    [SingleRecordActionKeys.DELETE]: {
      position: 2,
      label: msg`Delete dashboard`,
    },
    [SingleRecordActionKeys.EXPORT_FROM_RECORD_SHOW]: {
      position: 5,
      label: msg`Export dashboard`,
    },
    [SingleRecordActionKeys.DESTROY]: {
      position: 6,
      label: msg`Permanently destroy dashboard`,
    },
    [SingleRecordActionKeys.RESTORE]: {
      position: 7,
      label: msg`Restore dashboard`,
    },
    [SingleRecordActionKeys.NAVIGATE_TO_PREVIOUS_RECORD]: {
      position: 8,
      label: msg`Navigate to previous dashboard`,
    },
    [SingleRecordActionKeys.NAVIGATE_TO_NEXT_RECORD]: {
      position: 9,
      label: msg`Navigate to next dashboard`,
    },
    [NoSelectionRecordActionKeys.GO_TO_WORKFLOWS]: {
      position: 10,
    },
    [NoSelectionRecordActionKeys.GO_TO_PEOPLE]: {
      position: 11,
    },
    [NoSelectionRecordActionKeys.GO_TO_COMPANIES]: {
      position: 12,
    },
    [NoSelectionRecordActionKeys.GO_TO_OPPORTUNITIES]: {
      position: 13,
    },
    [NoSelectionRecordActionKeys.GO_TO_SETTINGS]: {
      position: 14,
    },
    [NoSelectionRecordActionKeys.GO_TO_TASKS]: {
      position: 15,
    },
    [NoSelectionRecordActionKeys.GO_TO_NOTES]: {
      position: 16,
    },
  },
});
