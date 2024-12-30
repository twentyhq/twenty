import { useAddToFavoritesSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useAddToFavoritesSingleRecordAction';
import { useDeleteSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useDeleteSingleRecordAction';
import { useDestroySingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useDestroySingleRecordAction';
import { useExportNoteAction } from '@/action-menu/actions/record-actions/single-record/hooks/useExportNoteAction';
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
  IconFileExport,
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
  exportNoteToPdf: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: SingleRecordActionKeys.EXPORT_NOTE_TO_PDF,
    label: 'Export to PDF',
    shortLabel: 'Export',
    position: 0,
    isPinned: false,
    Icon: IconFileExport,
    availableOn: [ActionAvailableOn.SHOW_PAGE],
    actionHook: useExportNoteAction,
  },
  addToFavoritesSingleRecord: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: SingleRecordActionKeys.ADD_TO_FAVORITES,
    label: 'Add to favorites',
    shortLabel: 'Add to favorites',
    position: 1,
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
    position: 2,
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
    key: SingleRecordActionKeys.DELETE,
    label: 'Delete record',
    shortLabel: 'Delete',
    position: 3,
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
    key: SingleRecordActionKeys.DESTROY,
    label: 'Permanently destroy record',
    shortLabel: 'Destroy',
    position: 4,
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
    key: SingleRecordActionKeys.NAVIGATE_TO_PREVIOUS_RECORD,
    label: 'Navigate to previous record',
    shortLabel: '',
    position: 5,
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
    position: 6,
    isPinned: true,
    Icon: IconChevronDown,
    availableOn: [ActionAvailableOn.SHOW_PAGE],
    actionHook: useNavigateToNextRecordSingleRecordAction,
  },
};
