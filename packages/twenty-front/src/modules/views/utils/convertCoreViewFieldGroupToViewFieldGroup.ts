import { type ViewFieldGroup } from '@/views/types/ViewFieldGroup';
import { convertCoreViewFieldToViewField } from '@/views/utils/convertCoreViewFieldToViewField';
import {
  type CoreViewField,
  type CoreViewFieldGroup,
} from '~/generated-metadata/graphql';

type CoreViewFieldGroupInput = Pick<
  CoreViewFieldGroup,
  'id' | 'name' | 'position' | 'isVisible' | 'viewId' | 'isOverridden'
> & {
  viewFields: Pick<
    CoreViewField,
    | 'id'
    | 'fieldMetadataId'
    | 'position'
    | 'isVisible'
    | 'size'
    | 'aggregateOperation'
    | 'isOverridden'
  >[];
};

export const convertCoreViewFieldGroupToViewFieldGroup = (
  coreViewFieldGroup: CoreViewFieldGroupInput,
): ViewFieldGroup => {
  return {
    __typename: 'ViewFieldGroup',
    id: coreViewFieldGroup.id,
    name: coreViewFieldGroup.name,
    position: coreViewFieldGroup.position,
    isVisible: coreViewFieldGroup.isVisible,
    isOverridden: coreViewFieldGroup.isOverridden ?? false,
    viewId: coreViewFieldGroup.viewId,
    viewFields: coreViewFieldGroup.viewFields.map(
      convertCoreViewFieldToViewField,
    ),
  };
};
