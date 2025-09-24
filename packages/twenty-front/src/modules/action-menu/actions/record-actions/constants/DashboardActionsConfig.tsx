import { CancelDashboardSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/dashboard-actions/components/CancelDashboardSingleRecordAction';
import { EditDashboardSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/dashboard-actions/components/EditDashboardSingleRecordAction';
import { SaveDashboardSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/dashboard-actions/components/SaveDashboardSingleRecordAction';
import { DashboardSingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/dashboard-actions/types/DashboardSingleRecordActionKeys';
import { SingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/types/SingleRecordActionsKey';
import { inheritActionsFromDefaultConfig } from '@/action-menu/actions/record-actions/utils/inheritActionsFromDefaultConfig';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconDeviceFloppy, IconPencil, IconX } from 'twenty-ui/display';

export const DASHBOARD_ACTIONS_CONFIG = inheritActionsFromDefaultConfig({
  config: {
    [DashboardSingleRecordActionKeys.EDIT_DASHBOARD]: {
      key: DashboardSingleRecordActionKeys.EDIT_DASHBOARD,
      label: msg`Edit Dashboard`,
      shortLabel: msg`Edit`,
      isPinned: true,
      position: 0,
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
    [DashboardSingleRecordActionKeys.SAVE_DASHBOARD]: {
      key: DashboardSingleRecordActionKeys.SAVE_DASHBOARD,
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
    [DashboardSingleRecordActionKeys.CANCEL_DASHBOARD_EDITION]: {
      key: DashboardSingleRecordActionKeys.CANCEL_DASHBOARD_EDITION,
      label: msg`Cancel Edition`,
      shortLabel: msg`Cancel`,
      isPinned: true,
      position: 2,
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
  },
  actionKeys: [
    SingleRecordActionKeys.ADD_TO_FAVORITES,
    SingleRecordActionKeys.REMOVE_FROM_FAVORITES,
    SingleRecordActionKeys.DELETE,
    SingleRecordActionKeys.DESTROY,
    SingleRecordActionKeys.RESTORE,
    SingleRecordActionKeys.EXPORT_FROM_RECORD_SHOW,
    SingleRecordActionKeys.NAVIGATE_TO_PREVIOUS_RECORD,
    SingleRecordActionKeys.NAVIGATE_TO_NEXT_RECORD,
  ],
  propertiesToOverwrite: {
    [SingleRecordActionKeys.ADD_TO_FAVORITES]: {
      position: 3,
    },
    [SingleRecordActionKeys.REMOVE_FROM_FAVORITES]: {
      position: 4,
    },
    [SingleRecordActionKeys.DELETE]: {
      position: 5,
      label: msg`Delete dashboard`,
    },
    [SingleRecordActionKeys.EXPORT_FROM_RECORD_SHOW]: {
      position: 6,
      label: msg`Export dashboard`,
    },
    [SingleRecordActionKeys.DESTROY]: {
      position: 7,
      label: msg`Permanently destroy dashboard`,
    },
    [SingleRecordActionKeys.RESTORE]: {
      position: 8,
      label: msg`Restore dashboard`,
    },
    [SingleRecordActionKeys.NAVIGATE_TO_PREVIOUS_RECORD]: {
      position: 9,
      label: msg`Navigate to previous dashboard`,
    },
    [SingleRecordActionKeys.NAVIGATE_TO_NEXT_RECORD]: {
      position: 10,
      label: msg`Navigate to next dashboard`,
    },
  },
});
