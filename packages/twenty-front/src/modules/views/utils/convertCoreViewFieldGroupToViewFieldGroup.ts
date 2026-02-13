import { type ViewFieldGroup } from '@/views/types/ViewFieldGroup';
import { convertCoreViewFieldToViewField } from '@/views/utils/convertCoreViewFieldToViewField';
import { type CoreViewFieldGroup } from '~/generated-metadata/graphql';

export const convertCoreViewFieldGroupToViewFieldGroup = (
  coreViewFieldGroup: Omit<
    CoreViewFieldGroup,
    'workspaceId' | 'createdAt' | 'updatedAt'
  >,
): ViewFieldGroup => {
  return {
    __typename: 'ViewFieldGroup',
    id: coreViewFieldGroup.id,
    name: coreViewFieldGroup.name,
    position: coreViewFieldGroup.position,
    isVisible: coreViewFieldGroup.isVisible,
    viewId: coreViewFieldGroup.viewId,
    viewFields: coreViewFieldGroup.viewFields.map(
      convertCoreViewFieldToViewField,
    ),
  };
};
