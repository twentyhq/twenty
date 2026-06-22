import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { isManyToOneRelationToWorkspaceMember } from '@/object-metadata/utils/isManyToOneRelationToWorkspaceMember';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type ViewGroup } from '@/views/types/ViewGroup';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

const useViewsSideEffectsOnViewGroups = () => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

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

    const mainGroupByField = objectMetadataItem.fields?.find(
      (field) => field.id === mainGroupByFieldMetadataId,
    );

    // Relation grouping generates its columns dynamically from the workspace
    // member list, so no view groups are persisted.
    if (
      isDefined(mainGroupByField) &&
      isManyToOneRelationToWorkspaceMember(mainGroupByField)
    ) {
      return { viewGroupsToCreate: [] };
    }

    let viewGroupsToCreate: ViewGroup[] = [];

    viewGroupsToCreate =
      mainGroupByField?.options?.map(
        (option, index) =>
          ({
            id: v4(),
            fieldValue: option.value,
            isVisible: true,
            position: index,
          }) satisfies ViewGroup,
      ) ?? [];

    if (mainGroupByField?.isNullable === true) {
      viewGroupsToCreate.push({
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
