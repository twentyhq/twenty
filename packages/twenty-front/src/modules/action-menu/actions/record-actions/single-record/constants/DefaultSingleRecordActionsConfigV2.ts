import { useAddToFavoritesSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useAddToFavoritesSingleRecordAction';
import { useDeleteSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useDeleteSingleRecordAction';
import { useDestroySingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useDestroySingleRecordAction';
import { useNavigateToNextRecordSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useNavigateToNextRecordSingleRecordAction';
import { useNavigateToPreviousRecordSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useNavigateToPreviousRecordSingleRecordAction';
import { useRemoveFromFavoritesSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useRemoveFromFavoritesSingleRecordAction';
import { ActionAvailableOn } from '@/action-menu/actions/types/actionAvailableOn';
import { SingleRecordActionHook } from '@/action-menu/actions/types/singleRecordActionHook';
import {
  ActionMenuEntry,
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import {
  IconChevronDown,
  IconChevronUp,
  IconHeart,
  IconHeartOff,
  IconTrash,
  IconTrashX,
} from 'twenty-ui';

export const DEFAULT_SINGLE_RECORD_ACTIONS_CONFIG_V2: Record<
  string,
  ActionMenuEntry & {
    actionHook: SingleRecordActionHook;
  }
> = {
  addToFavoritesSingleRecord: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: 'add-to-favorites-single-record',
    label: 'Add to favorites',
    shortLabel: 'Add to favorites',
    position: 0,
    isPinned: true,
    Icon: IconHeart,
    availableOn: [
      ActionAvailableOn.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionAvailableOn.SHOW_PAGE,
    ],
    actionHook: useAddToFavoritesSingleRecordAction,
  },
  removeFromFavoritesSingleRecord: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: 'remove-from-favorites-single-record',
    label: 'Remove from favorites',
    shortLabel: 'Remove from favorites',
    isPinned: true,
    position: 1,
    Icon: IconHeartOff,
    availableOn: [
      ActionAvailableOn.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionAvailableOn.SHOW_PAGE,
    ],
    actionHook: useRemoveFromFavoritesSingleRecordAction,
  },
  deleteSingleRecord: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: 'delete-single-record',
    label: 'Delete record',
    shortLabel: 'Delete',
    position: 2,
    Icon: IconTrash,
    accent: 'danger',
    isPinned: true,
    availableOn: [
      ActionAvailableOn.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionAvailableOn.SHOW_PAGE,
    ],
    actionHook: useDeleteSingleRecordAction,
  },
  destroySingleRecord: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: 'destroy-single-record',
    label: 'Permanently destroy record',
    shortLabel: 'Destroy',
    position: 3,
    Icon: IconTrashX,
    accent: 'danger',
    isPinned: true,
    availableOn: [
      ActionAvailableOn.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionAvailableOn.SHOW_PAGE,
    ],
    actionHook: useDestroySingleRecordAction,
  },
  navigateToPreviousRecord: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: 'navigate-to-previous-record',
    label: 'Navigate to previous record',
    shortLabel: '',
    position: 4,
    isPinned: true,
    Icon: IconChevronUp,
    availableOn: [ActionAvailableOn.SHOW_PAGE],
    actionHook: useNavigateToPreviousRecordSingleRecordAction,
  },
  navigateToNextRecord: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: 'navigate-to-next-record',
    label: 'Navigate to next record',
    shortLabel: '',
    position: 5,
    isPinned: true,
    Icon: IconChevronDown,
    availableOn: [ActionAvailableOn.SHOW_PAGE],
    actionHook: useNavigateToNextRecordSingleRecordAction,
  },
};
