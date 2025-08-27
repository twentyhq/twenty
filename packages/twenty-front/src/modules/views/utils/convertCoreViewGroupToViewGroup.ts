import { type ViewGroup } from '@/views/types/ViewGroup';
import { type CoreViewGroup } from '~/generated/graphql';

export const convertCoreViewGroupToViewGroup = (
  coreViewGroup: Omit<CoreViewGroup, 'workspaceId'>,
): ViewGroup => {
  return {
    __typename: 'ViewGroup',
    id: coreViewGroup.id,
    fieldMetadataId: coreViewGroup.fieldMetadataId,
    isVisible: coreViewGroup.isVisible,
    fieldValue: coreViewGroup.fieldValue,
    position: coreViewGroup.position,
  };
};
