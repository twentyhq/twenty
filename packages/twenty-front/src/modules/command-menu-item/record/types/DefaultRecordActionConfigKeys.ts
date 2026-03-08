import { type MultipleRecordsActionKeys } from '@/command-menu-item/record/multiple-records/types/MultipleRecordsActionKeys';
import { type NoSelectionRecordActionKeys } from '@/command-menu-item/record/no-selection/types/NoSelectionRecordActionsKeys';
import { type SingleRecordActionKeys } from '@/command-menu-item/record/single-record/types/SingleRecordActionsKey';

export type DefaultRecordActionConfigKeys =
  | NoSelectionRecordActionKeys
  | SingleRecordActionKeys
  | MultipleRecordsActionKeys;
