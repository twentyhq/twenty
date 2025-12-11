import { type ViewGroup } from '@/views/types/ViewGroup';
import { type CoreViewGroup } from '~/generated/graphql';

export const convertCoreViewGroupToViewGroup = (
  coreViewGroup: Pick<
    CoreViewGroup,
    'id' | 'isVisible' | 'fieldValue' | 'position'
  >,
): ViewGroup => {
  return {
    __typename: 'ViewGroup',
    id: coreViewGroup.id,
    isVisible: coreViewGroup.isVisible,
    fieldValue: coreViewGroup.fieldValue,
    position: coreViewGroup.position,
  };
};
