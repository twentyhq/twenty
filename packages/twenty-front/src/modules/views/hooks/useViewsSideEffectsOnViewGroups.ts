import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ViewGroup } from '@/views/types/ViewGroup';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

const useViewsSideEffectsOnViewGroups = () => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsState);

  const triggerViewGroupOptimisticEffectAtViewCreation = ({
    mainGroupByFieldMetadataId,
    objectMetadataItemId,
  }: {
    mainGroupByFieldMetadataId?: string | null;
    objectMetadataItemId: string;
  }) => {
    if (!isDefined(mainGroupByFieldMetadataId)) {
      return {};
    }

    const objectMetadataItem = objectMetadataItems.find(
      (objectMetadataItem) => objectMetadataItem.id === objectMetadataItemId,
    );

    if (!isDefined(objectMetadataItem)) {
      throw new Error('Object metadata item not found');
    }

    let viewGroupsToCreate: ViewGroup[] = [];

    viewGroupsToCreate =
      objectMetadataItem.fields
        ?.find((field) => field.id === mainGroupByFieldMetadataId)
        ?.options?.map(
          (option, index) =>
            ({
              id: v4(),
              __typename: 'ViewGroup',
              fieldValue: option.value,
              isVisible: true,
              position: index,
            }) satisfies ViewGroup,
        ) ?? [];

    if (
      objectMetadataItem.fields.find(
        (field) => field.id === mainGroupByFieldMetadataId,
      )?.isNullable === true
    ) {
      viewGroupsToCreate.push({
        __typename: 'ViewGroup',
        id: v4(),
        fieldValue: '',
        position: viewGroupsToCreate.length,
        isVisible: true,
      } satisfies ViewGroup);
    }

    return { viewGroupsToCreate };
  };

  return {
    triggerViewGroupOptimisticEffectAtViewCreation,
  };
};

export { useViewsSideEffectsOnViewGroups };
