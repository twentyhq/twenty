import { useAddToFavoritesSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useAddToFavoritesSingleRecordAction';
import { useNavigateToNextRecordSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useNavigateToNextRecordSingleRecordAction';
import { useNavigateToPreviousRecordSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useNavigateToPreviousRecordSingleRecordAction';
import { useRemoveFromFavoritesSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useRemoveFromFavoritesSingleRecordAction';
import { SingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/types/SingleRecordActionsKey';
import { ActionAvailableOn } from '@/action-menu/actions/types/ActionAvailableOn';
import { SingleRecordActionHook } from '@/action-menu/actions/types/SingleRecordActionHook';
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
} from 'twenty-ui';

export const WORKFLOW_RUNS_SINGLE_RECORD_ACTIONS_CONFIG: Record<
  string,
  ActionMenuEntry & {
    actionHook: SingleRecordActionHook;
  }
> = {
  addToFavoritesSingleRecord: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: SingleRecordActionKeys.ADD_TO_FAVORITES,
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
    key: SingleRecordActionKeys.REMOVE_FROM_FAVORITES,
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
  navigateToPreviousRecord: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: SingleRecordActionKeys.NAVIGATE_TO_PREVIOUS_RECORD,
    label: 'Navigate to previous record',
    shortLabel: '',
    position: 2,
    isPinned: true,
    Icon: IconChevronUp,
    availableOn: [ActionAvailableOn.SHOW_PAGE],
    actionHook: useNavigateToPreviousRecordSingleRecordAction,
  },
  navigateToNextRecord: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: SingleRecordActionKeys.NAVIGATE_TO_NEXT_RECORD,
    label: 'Navigate to next record',
    shortLabel: '',
    position: 3,
    isPinned: true,
    Icon: IconChevronDown,
    availableOn: [ActionAvailableOn.SHOW_PAGE],
    actionHook: useNavigateToNextRecordSingleRecordAction,
  },
};
