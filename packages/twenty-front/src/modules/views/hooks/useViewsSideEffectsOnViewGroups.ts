import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useTriggerViewGroupOptimisticEffect } from '@/views/optimistic-effects/hooks/useTriggerViewGroupOptimisticEffect';
import { type ViewGroup } from '@/views/types/ViewGroup';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { type CoreViewGroup } from '~/generated-metadata/graphql';

const useViewsSideEffectsOnViewGroups = () => {
  const { triggerViewGroupOptimisticEffect } =
    useTriggerViewGroupOptimisticEffect();

  const objectMetadataItems = useRecoilValueV2(objectMetadataItemsState);

  const triggerViewGroupOptimisticEffectAtViewCreation = ({
    newViewId,
    mainGroupByFieldMetadataId,
    objectMetadataItemId,
  }: {
    newViewId: string;
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

    triggerViewGroupOptimisticEffect({
      createdViewGroups: viewGroupsToCreate.map(
        ({ __typename, ...viewGroup }) =>
          ({
            ...viewGroup,
            viewId: newViewId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
          }) as Omit<CoreViewGroup, 'workspaceId'>,
      ),
    });

    return { viewGroupsToCreate };
  };

  return {
    triggerViewGroupOptimisticEffectAtViewCreation,
  };
};

export { useViewsSideEffectsOnViewGroups };
