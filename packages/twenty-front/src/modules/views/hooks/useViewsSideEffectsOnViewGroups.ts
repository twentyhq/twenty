import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useTriggerViewGroupOptimisticEffect } from '@/views/optimistic-effects/hooks/useTriggerViewGroupOptimisticEffect';
import { type View } from '@/views/types/View';
import { type ViewGroup } from '@/views/types/ViewGroup';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { type CoreViewGroup } from '~/generated/graphql';

const useViewsSideEffectsOnViewGroups = () => {
  const { triggerViewGroupOptimisticEffect } =
    useTriggerViewGroupOptimisticEffect();

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const triggerViewGroupSideEffectAtViewCreation = ({
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

  const getViewGroupsToCreateAtViewUpdate = ({
    existingView,
    newMainGroupByFieldMetadataId,
    objectMetadataItemId,
  }: {
    existingView: View;
    newMainGroupByFieldMetadataId?: string | null;
    objectMetadataItemId: string;
  }) => {
    if (newMainGroupByFieldMetadataId === undefined) {
      return {};
    }

    const objectMetadataItem = objectMetadataItems.find(
      (objectMetadataItem) => objectMetadataItem.id === objectMetadataItemId,
    );

    if (!isDefined(objectMetadataItem)) {
      throw new Error('Object metadata item not found');
    }

    let viewGroupsToCreate: ViewGroup[] = [];
    let viewGroupsToDelete: ViewGroup[] = [];

    if (
      newMainGroupByFieldMetadataId !== undefined &&
      newMainGroupByFieldMetadataId !== existingView.mainGroupByFieldMetadataId
    ) {
      // TODO delete existing view groups

      if (isDefined(newMainGroupByFieldMetadataId)) {
        viewGroupsToCreate =
          objectMetadataItem.fields
            ?.find((field) => field.id === newMainGroupByFieldMetadataId)
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
            (field) => field.id === newMainGroupByFieldMetadataId,
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
      }
    }

    return { viewGroupsToCreate };
  };

  return {
    triggerViewGroupSideEffectAtViewCreation,
    getViewGroupsToCreateAtViewUpdate,
  };
};

export default useViewsSideEffectsOnViewGroups;
