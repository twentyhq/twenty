import { ActionHookResult } from '@/action-menu/actions/types/ActionHookResult';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export type SingleRecordActionHook =
  | SingleRecordActionHookWithoutObjectMetadataItem
  | SingleRecordActionHookWithObjectMetadataItem;

export type SingleRecordActionHookWithoutObjectMetadataItem = ({
  recordId,
}: {
  recordId: string;
}) => ActionHookResult;

export type SingleRecordActionHookWithObjectMetadataItem = ({
  recordId,
  objectMetadataItem,
}: {
  recordId: string;
  objectMetadataItem: ObjectMetadataItem;
}) => ActionHookResult;
