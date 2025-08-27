import { type MultipleRecordsActionKeys } from '@/action-menu/actions/record-actions/multiple-records/types/MultipleRecordsActionKeys';
import { type NoSelectionRecordActionKeys } from '@/action-menu/actions/record-actions/no-selection/types/NoSelectionRecordActionsKeys';
import { type SingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/types/SingleRecordActionsKey';

export type DefaultRecordActionConfigKeys =
  | NoSelectionRecordActionKeys
  | SingleRecordActionKeys
  | MultipleRecordsActionKeys;
