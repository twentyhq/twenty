import { ActionHookResult } from '@/action-menu/actions/types/ActionHookResult';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export type ActionHook =
  | ActionHookWithoutObjectMetadataItem
  | ActionHookWithObjectMetadataItem;

export type ActionHookWithoutObjectMetadataItem = () => ActionHookResult;

export type ActionHookWithObjectMetadataItem = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => ActionHookResult;
