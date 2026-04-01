import { type MultipleRecordsCommandKeys } from '@/command-menu-item/record/multiple-records/types/MultipleRecordsCommandKeys';
import { type NoSelectionRecordCommandKeys } from '@/command-menu-item/record/no-selection/types/NoSelectionRecordCommandKeys';
import { type RecordCommandKeys } from '@/command-menu-item/record/types/RecordCommandKeys';
import { type SingleRecordCommandKeys } from '@/command-menu-item/record/single-record/types/SingleRecordCommandKeys';

export type DefaultRecordCommandKeys =
  | NoSelectionRecordCommandKeys
  | SingleRecordCommandKeys
  | MultipleRecordsCommandKeys
  | RecordCommandKeys;
