import { ApproveChangeRequestAction } from '@/action-menu/actions/record-actions/single-record/change-request-actions/components/ApproveChangeRequestAction';
import { RejectChangeRequestAction } from '@/action-menu/actions/record-actions/single-record/change-request-actions/components/RejectChangeRequestAction';
import { ChangeRequestSingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/change-request-actions/types/ChangeRequestSingleRecordActionKeys';
import { MultipleRecordsActionKeys } from '@/action-menu/actions/record-actions/multiple-records/types/MultipleRecordsActionKeys';
import { NoSelectionRecordActionKeys } from '@/action-menu/actions/record-actions/no-selection/types/NoSelectionRecordActionsKeys';
import { SingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/types/SingleRecordActionsKey';
import { inheritActionsFromDefaultConfig } from '@/action-menu/actions/record-actions/utils/inheritActionsFromDefaultConfig';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconCheck, IconX } from 'twenty-ui/display';

export const CHANGE_REQUEST_ACTIONS_CONFIG = inheritActionsFromDefaultConfig({
  config: {
    [ChangeRequestSingleRecordActionKeys.APPROVE_CHANGE_REQUEST]: {
      key: ChangeRequestSingleRecordActionKeys.APPROVE_CHANGE_REQUEST,
      label: msg`Approve`,
      shortLabel: msg`Approve`,
      isPinned: true,
      position: 1,
      Icon: IconCheck,
      type: ActionType.Standard,
      scope: ActionScope.RecordSelection,
      shouldBeRegistered: ({ selectedRecord, objectPermissions }) =>
        isDefined(selectedRecord) &&
        !isDefined(selectedRecord?.deletedAt) &&
        selectedRecord?.requestStatus === 'PENDING' &&
        objectPermissions.canUpdateObjectRecords,
      availableOn: [
        ActionViewType.SHOW_PAGE,
        ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ],
      component: <ApproveChangeRequestAction />,
    },
    [ChangeRequestSingleRecordActionKeys.REJECT_CHANGE_REQUEST]: {
      key: ChangeRequestSingleRecordActionKeys.REJECT_CHANGE_REQUEST,
      label: msg`Reject`,
      shortLabel: msg`Reject`,
      isPinned: true,
      position: 2,
      Icon: IconX,
      type: ActionType.Standard,
      scope: ActionScope.RecordSelection,
      shouldBeRegistered: ({ selectedRecord, objectPermissions }) =>
        isDefined(selectedRecord) &&
        !isDefined(selectedRecord?.deletedAt) &&
        selectedRecord?.requestStatus === 'PENDING' &&
        objectPermissions.canUpdateObjectRecords,
      availableOn: [
        ActionViewType.SHOW_PAGE,
        ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ],
      component: <RejectChangeRequestAction />,
    },
  },
  actionKeys: [
    SingleRecordActionKeys.DELETE,
    SingleRecordActionKeys.DESTROY,
    SingleRecordActionKeys.RESTORE,
    SingleRecordActionKeys.EXPORT_FROM_RECORD_SHOW,
    MultipleRecordsActionKeys.DELETE,
    MultipleRecordsActionKeys.EXPORT,
    NoSelectionRecordActionKeys.CREATE_NEW_RECORD,
    NoSelectionRecordActionKeys.EXPORT_VIEW,
  ],
  propertiesToOverwrite: {},
});
