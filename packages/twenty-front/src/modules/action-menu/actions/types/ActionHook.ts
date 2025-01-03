import { ActionHookResult } from '@/action-menu/actions/types/ActionHookResult';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export type ActionHook =
  | ActionHookWithoutObjectMetadataItem
  | ActionHookWithObjectMetadataItem;

export type ActionHookWithoutObjectMetadataItem = (
  recordIds?: string[],
) => ActionHookResult;

export type ActionHookWithObjectMetadataItem = ({
  recordIds,
  objectMetadataItem,
}: {
  recordIds?: string[];
  objectMetadataItem: ObjectMetadataItem;
}) => ActionHookResult;
