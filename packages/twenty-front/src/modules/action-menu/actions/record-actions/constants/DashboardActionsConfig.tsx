import { MultipleRecordsActionKeys } from '@/action-menu/actions/record-actions/multiple-records/types/MultipleRecordsActionKeys';
import { NoSelectionRecordActionKeys } from '@/action-menu/actions/record-actions/no-selection/types/NoSelectionRecordActionsKeys';
import { CancelDashboardSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/dashboard-actions/components/CancelDashboardSingleRecordAction';
import { DuplicateDashboardSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/dashboard-actions/components/DuplicateDashboardSingleRecordAction';
import { EditDashboardSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/dashboard-actions/components/EditDashboardSingleRecordAction';
import { SaveDashboardSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/dashboard-actions/components/SaveDashboardSingleRecordAction';
import { DashboardSingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/dashboard-actions/types/DashboardSingleRecordActionKeys';
import { SingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/types/SingleRecordActionsKey';
import { inheritActionsFromDefaultConfig } from '@/action-menu/actions/record-actions/utils/inheritActionsFromDefaultConfig';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { PageLayoutSingleRecordActionKeys } from '@/page-layout/actions/PageLayoutSingleRecordActionKeys';
import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  IconCancel,
  IconCopyPlus,
  IconDeviceFloppy,
  IconPencil,
} from 'twenty-ui/display';

export const DASHBOARD_ACTIONS_CONFIG = inheritActionsFromDefaultConfig({
  config: {
    [PageLayoutSingleRecordActionKeys.EDIT_LAYOUT]: {
      key: PageLayoutSingleRecordActionKeys.EDIT_LAYOUT,
      label: msg`Edit Dashboard`,
      shortLabel: msg`Edit`,
      isPinned: true,
      position: 3,
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
      position: 4,
      Icon: IconDeviceFloppy,
      type: ActionType.Standard,
      scope: ActionScope.RecordSelection,
      shouldBeRegistered: ({ selectedRecord }) =>
        isDefined(selectedRecord) &&
        !selectedRecord?.isRemote &&
        !isDefined(selectedRecord?.deletedAt) &&
        isDefined(selectedRecord?.pageLayoutId),
      availableOn: [ActionViewType.PAGE_EDIT_MODE],
      component: <SaveDashboardSingleRecordAction />,
    },
    [PageLayoutSingleRecordActionKeys.CANCEL_LAYOUT_EDITION]: {
      key: PageLayoutSingleRecordActionKeys.CANCEL_LAYOUT_EDITION,
      label: msg`Cancel Edition`,
      shortLabel: msg`Cancel`,
      isPinned: true,
      position: 5,
      Icon: IconCancel,
      type: ActionType.Standard,
      scope: ActionScope.RecordSelection,
      shouldBeRegistered: ({ selectedRecord }) =>
        isDefined(selectedRecord) &&
        !selectedRecord?.isRemote &&
        !isDefined(selectedRecord?.deletedAt) &&
        isDefined(selectedRecord?.pageLayoutId),
      availableOn: [ActionViewType.PAGE_EDIT_MODE],
      component: <CancelDashboardSingleRecordAction />,
    },
    [DashboardSingleRecordActionKeys.DUPLICATE_DASHBOARD]: {
      key: DashboardSingleRecordActionKeys.DUPLICATE_DASHBOARD,
      label: msg`Duplicate Dashboard`,
      shortLabel: msg`Duplicate`,
      isPinned: false,
      position: 6,
      Icon: IconCopyPlus,
      type: ActionType.Standard,
      scope: ActionScope.RecordSelection,
      shouldBeRegistered: ({ selectedRecord }) =>
        isDefined(selectedRecord) &&
        !selectedRecord?.isRemote &&
        !isDefined(selectedRecord?.deletedAt) &&
        isDefined(selectedRecord?.pageLayoutId),
      availableOn: [
        ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
        ActionViewType.SHOW_PAGE,
      ],
      component: <DuplicateDashboardSingleRecordAction />,
    },
  },
  actionKeys: [
    NoSelectionRecordActionKeys.CREATE_NEW_RECORD,
    SingleRecordActionKeys.ADD_TO_FAVORITES,
    SingleRecordActionKeys.REMOVE_FROM_FAVORITES,
    SingleRecordActionKeys.DELETE,
    SingleRecordActionKeys.DESTROY,
    SingleRecordActionKeys.RESTORE,
    MultipleRecordsActionKeys.DELETE,
    MultipleRecordsActionKeys.DESTROY,
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
      position: 2,
      label: msg`Create new dashboard`,
    },
    [SingleRecordActionKeys.DELETE]: {
      position: 7,
      label: msg`Delete dashboard`,
    },
    [MultipleRecordsActionKeys.DELETE]: {
      position: 12,
      label: msg`Delete dashboards`,
    },
    [SingleRecordActionKeys.ADD_TO_FAVORITES]: {
      position: 8,
      isPinned: true,
    },
    [SingleRecordActionKeys.REMOVE_FROM_FAVORITES]: {
      position: 9,
      isPinned: true,
    },
    [SingleRecordActionKeys.EXPORT_FROM_RECORD_SHOW]: {
      position: 10,
      label: msg`Export dashboard`,
    },
    [SingleRecordActionKeys.DESTROY]: {
      position: 11,
      label: msg`Permanently destroy dashboard`,
    },
    [MultipleRecordsActionKeys.DESTROY]: {
      position: 13,
      label: msg`Permanently destroy dashboards`,
    },
    [SingleRecordActionKeys.RESTORE]: {
      position: 14,
      label: msg`Restore dashboard`,
    },
    [NoSelectionRecordActionKeys.GO_TO_WORKFLOWS]: {
      position: 15,
    },
    [NoSelectionRecordActionKeys.GO_TO_PEOPLE]: {
      position: 16,
    },
    [NoSelectionRecordActionKeys.GO_TO_COMPANIES]: {
      position: 17,
    },
    [NoSelectionRecordActionKeys.GO_TO_OPPORTUNITIES]: {
      position: 18,
    },
    [NoSelectionRecordActionKeys.GO_TO_SETTINGS]: {
      position: 19,
    },
    [NoSelectionRecordActionKeys.GO_TO_TASKS]: {
      position: 20,
    },
    [NoSelectionRecordActionKeys.GO_TO_NOTES]: {
      position: 21,
    },
  },
});
