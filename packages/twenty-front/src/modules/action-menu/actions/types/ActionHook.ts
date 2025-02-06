import { ActionHookResult } from '@/action-menu/actions/types/ActionHookResult';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export type ActionHook =
  | ActionHookWithoutObjectMetadataItem
  | ActionHookWithObjectMetadataItem;

export type ActionHookWithoutObjectMetadataItem = () => ActionHookResult;

type ActionHookWithObjectMetadataItemParams = {
  objectMetadataItem: ObjectMetadataItem;
};
export type ActionHookWithObjectMetadataItem = (
  params: ActionHookWithObjectMetadataItemParams,
) => ActionHookResult;
