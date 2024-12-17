import { useAddToFavoritesSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useAddToFavoritesSingleRecordAction';
import { useDeleteSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useDeleteSingleRecordAction';
import { useRemoveFromFavoritesSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useRemoveFromFavoritesSingleRecordAction';
import { SingleRecordActionHook } from '@/action-menu/actions/types/singleRecordActionHook';
import {
  ActionMenuEntry,
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { IconHeart, IconHeartOff, IconTrash } from 'twenty-ui';

export const DEFAULT_SINGLE_RECORD_ACTIONS_CONFIG_V1: Record<
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
    position: 0,
    Icon: IconHeart,
    actionHook: useAddToFavoritesSingleRecordAction,
  },
  removeFromFavoritesSingleRecord: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: 'remove-from-favorites-single-record',
    label: 'Remove from favorites',
    position: 1,
    Icon: IconHeartOff,
    actionHook: useRemoveFromFavoritesSingleRecordAction,
  },
  deleteSingleRecord: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: 'delete-single-record',
    label: 'Delete',
    position: 2,
    Icon: IconTrash,
    accent: 'danger',
    isPinned: true,
    actionHook: useDeleteSingleRecordAction,
  },
};
