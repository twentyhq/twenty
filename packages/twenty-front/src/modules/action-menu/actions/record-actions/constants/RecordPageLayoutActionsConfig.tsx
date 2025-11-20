import { CancelRecordPageLayoutSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/record-page-layout-actions/components/CancelRecordPageLayoutSingleRecordAction';
import { EditRecordPageLayoutSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/record-page-layout-actions/components/EditRecordPageLayoutSingleRecordAction';
import { SaveRecordPageLayoutSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/record-page-layout-actions/components/SaveRecordPageLayoutSingleRecordAction';
import { SingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/types/SingleRecordActionsKey';
import { inheritActionsFromDefaultConfig } from '@/action-menu/actions/record-actions/utils/inheritActionsFromDefaultConfig';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { PageLayoutSingleRecordActionKeys } from '@/page-layout/actions/PageLayoutSingleRecordActionKeys';
import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconDeviceFloppy, IconPencil, IconX } from 'twenty-ui/display';

export const RECORD_PAGE_LAYOUT_ACTIONS_CONFIG =
  inheritActionsFromDefaultConfig({
    config: {
      [PageLayoutSingleRecordActionKeys.EDIT_LAYOUT]: {
        key: PageLayoutSingleRecordActionKeys.EDIT_LAYOUT,
        label: msg`Edit Layout`,
        shortLabel: msg`Edit`,
        isPinned: true,
        position: 2,
        Icon: IconPencil,
        type: ActionType.Standard,
        scope: ActionScope.RecordSelection,
        shouldBeRegistered: ({ selectedRecord }) =>
          isDefined(selectedRecord) &&
          !selectedRecord?.isRemote &&
          !isDefined(selectedRecord?.deletedAt),
        // TODO: Once backend is ready, uncomment the line below
        // isDefined(selectedRecord?.pageLayoutId),
        availableOn: [ActionViewType.SHOW_PAGE],
        component: <EditRecordPageLayoutSingleRecordAction />,
      },
      [PageLayoutSingleRecordActionKeys.SAVE_LAYOUT]: {
        key: PageLayoutSingleRecordActionKeys.SAVE_LAYOUT,
        label: msg`Save Layout`,
        shortLabel: msg`Save`,
        isPinned: true,
        position: 1,
        Icon: IconDeviceFloppy,
        type: ActionType.Standard,
        scope: ActionScope.RecordSelection,
        shouldBeRegistered: ({ selectedRecord }) =>
          isDefined(selectedRecord) &&
          !selectedRecord?.isRemote &&
          !isDefined(selectedRecord?.deletedAt),
        // TODO: Once backend is ready, uncomment the line below
        // isDefined(selectedRecord?.pageLayoutId),
        availableOn: [ActionViewType.PAGE_EDIT_MODE],
        component: <SaveRecordPageLayoutSingleRecordAction />,
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
          !isDefined(selectedRecord?.deletedAt),
        // TODO: Once backend is ready, uncomment the line below
        // isDefined(selectedRecord?.pageLayoutId),
        availableOn: [ActionViewType.PAGE_EDIT_MODE],
        component: <CancelRecordPageLayoutSingleRecordAction />,
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
        label: msg`Delete record`,
      },
      [SingleRecordActionKeys.EXPORT_FROM_RECORD_SHOW]: {
        position: 6,
        label: msg`Export record`,
      },
      [SingleRecordActionKeys.DESTROY]: {
        position: 7,
        label: msg`Permanently destroy record`,
      },
      [SingleRecordActionKeys.RESTORE]: {
        position: 8,
        label: msg`Restore record`,
      },
      [SingleRecordActionKeys.NAVIGATE_TO_PREVIOUS_RECORD]: {
        position: 9,
        label: msg`Navigate to previous record`,
      },
      [SingleRecordActionKeys.NAVIGATE_TO_NEXT_RECORD]: {
        position: 10,
        label: msg`Navigate to next record`,
      },
    },
  });
