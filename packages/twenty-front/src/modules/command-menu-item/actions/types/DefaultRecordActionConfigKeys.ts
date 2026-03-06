import { type MultipleRecordsActionKeys } from '@/command-menu-item/actions/record-actions/multiple-records/types/MultipleRecordsActionKeys';
import { type NoSelectionRecordActionKeys } from '@/command-menu-item/actions/record-actions/no-selection/types/NoSelectionRecordActionsKeys';
import { type SingleRecordActionKeys } from '@/command-menu-item/actions/record-actions/single-record/types/SingleRecordActionsKey';

export type DefaultRecordActionConfigKeys =
  | NoSelectionRecordActionKeys
  | SingleRecordActionKeys
  | MultipleRecordsActionKeys;
