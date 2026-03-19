import { MultipleRecordsActionKeys } from '@/action-menu/actions/record-actions/multiple-records/types/MultipleRecordsActionKeys';
import { NoSelectionRecordActionKeys } from '@/action-menu/actions/record-actions/no-selection/types/NoSelectionRecordActionsKeys';
import { ChangePaymentPlanAction } from '@/action-menu/actions/record-actions/single-record/subscription-actions/components/ChangePaymentPlanAction';
import { ExtendSubscriptionAction } from '@/action-menu/actions/record-actions/single-record/subscription-actions/components/ExtendSubscriptionAction';
import { OpenCaseAction } from '@/action-menu/actions/record-actions/single-record/subscription-actions/components/OpenCaseAction';
import { PauseSubscriptionAction } from '@/action-menu/actions/record-actions/single-record/subscription-actions/components/PauseSubscriptionAction';
import { UpdateStartDateAction } from '@/action-menu/actions/record-actions/single-record/subscription-actions/components/UpdateStartDateAction';
import { SubscriptionSingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/subscription-actions/types/SubscriptionSingleRecordActionKeys';
import { SingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/types/SingleRecordActionsKey';
import { inheritActionsFromDefaultConfig } from '@/action-menu/actions/record-actions/utils/inheritActionsFromDefaultConfig';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  IconCalendarEvent,
  IconCreditCard,
  IconFlag,
  IconPlayerPause,
  IconRefresh,
} from 'twenty-ui/display';

export const TOB_SUBSCRIPTION_ACTIONS_CONFIG = inheritActionsFromDefaultConfig({
  config: {
    [SubscriptionSingleRecordActionKeys.PAUSE_SUBSCRIPTION]: {
      key: SubscriptionSingleRecordActionKeys.PAUSE_SUBSCRIPTION,
      label: msg`Pause Subscription`,
      shortLabel: msg`Pause`,
      isPinned: true,
      position: 1,
      Icon: IconPlayerPause,
      type: ActionType.Standard,
      scope: ActionScope.RecordSelection,
      shouldBeRegistered: ({ selectedRecord, objectPermissions }) =>
        isDefined(selectedRecord) &&
        !isDefined(selectedRecord?.deletedAt) &&
        objectPermissions.canUpdateObjectRecords,
      availableOn: [
        ActionViewType.SHOW_PAGE,
        ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ],
      component: <PauseSubscriptionAction />,
    },
    [SubscriptionSingleRecordActionKeys.EXTEND_SUBSCRIPTION]: {
      key: SubscriptionSingleRecordActionKeys.EXTEND_SUBSCRIPTION,
      label: msg`Extend / Renew`,
      shortLabel: msg`Extend`,
      isPinned: true,
      position: 2,
      Icon: IconRefresh,
      type: ActionType.Standard,
      scope: ActionScope.RecordSelection,
      shouldBeRegistered: ({ selectedRecord, objectPermissions }) =>
        isDefined(selectedRecord) &&
        !isDefined(selectedRecord?.deletedAt) &&
        objectPermissions.canUpdateObjectRecords,
      availableOn: [
        ActionViewType.SHOW_PAGE,
        ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ],
      component: <ExtendSubscriptionAction />,
    },
    [SubscriptionSingleRecordActionKeys.CHANGE_PAYMENT_PLAN]: {
      key: SubscriptionSingleRecordActionKeys.CHANGE_PAYMENT_PLAN,
      label: msg`Change Payment Plan`,
      shortLabel: msg`Payment`,
      isPinned: false,
      position: 3,
      Icon: IconCreditCard,
      type: ActionType.Standard,
      scope: ActionScope.RecordSelection,
      shouldBeRegistered: ({ selectedRecord, objectPermissions }) =>
        isDefined(selectedRecord) &&
        !isDefined(selectedRecord?.deletedAt) &&
        objectPermissions.canUpdateObjectRecords,
      availableOn: [
        ActionViewType.SHOW_PAGE,
        ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ],
      component: <ChangePaymentPlanAction />,
    },
    [SubscriptionSingleRecordActionKeys.UPDATE_START_DATE]: {
      key: SubscriptionSingleRecordActionKeys.UPDATE_START_DATE,
      label: msg`Update Start Date`,
      shortLabel: msg`Start Date`,
      isPinned: false,
      position: 4,
      Icon: IconCalendarEvent,
      type: ActionType.Standard,
      scope: ActionScope.RecordSelection,
      shouldBeRegistered: ({ selectedRecord, objectPermissions }) =>
        isDefined(selectedRecord) &&
        !isDefined(selectedRecord?.deletedAt) &&
        objectPermissions.canUpdateObjectRecords,
      availableOn: [
        ActionViewType.SHOW_PAGE,
        ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ],
      component: <UpdateStartDateAction />,
    },
    [SubscriptionSingleRecordActionKeys.OPEN_CASE]: {
      key: SubscriptionSingleRecordActionKeys.OPEN_CASE,
      label: msg`Open Case / Escalation`,
      shortLabel: msg`Open Case`,
      isPinned: false,
      position: 5,
      Icon: IconFlag,
      type: ActionType.Standard,
      scope: ActionScope.RecordSelection,
      shouldBeRegistered: ({ selectedRecord, objectPermissions }) =>
        isDefined(selectedRecord) &&
        !isDefined(selectedRecord?.deletedAt) &&
        objectPermissions.canUpdateObjectRecords,
      availableOn: [
        ActionViewType.SHOW_PAGE,
        ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ],
      component: <OpenCaseAction />,
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
    MultipleRecordsActionKeys.DELETE,
    MultipleRecordsActionKeys.DESTROY,
    MultipleRecordsActionKeys.RESTORE,
    MultipleRecordsActionKeys.EXPORT,
    NoSelectionRecordActionKeys.CREATE_NEW_RECORD,
    NoSelectionRecordActionKeys.SEE_DELETED_RECORDS,
    NoSelectionRecordActionKeys.HIDE_DELETED_RECORDS,
    NoSelectionRecordActionKeys.IMPORT_RECORDS,
    NoSelectionRecordActionKeys.EXPORT_VIEW,
    NoSelectionRecordActionKeys.GO_TO_WORKFLOWS,
    NoSelectionRecordActionKeys.GO_TO_PEOPLE,
    NoSelectionRecordActionKeys.GO_TO_COMPANIES,
    NoSelectionRecordActionKeys.GO_TO_OPPORTUNITIES,
    NoSelectionRecordActionKeys.GO_TO_SETTINGS,
    NoSelectionRecordActionKeys.GO_TO_TASKS,
    NoSelectionRecordActionKeys.GO_TO_NOTES,
  ],
  propertiesToOverwrite: {},
});
