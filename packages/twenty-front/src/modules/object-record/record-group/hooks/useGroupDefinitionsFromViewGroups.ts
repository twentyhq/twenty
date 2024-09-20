import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  RecordGroupDefinition,
  RecordGroupDefinitionType,
} from '@/object-record/record-group/types/RecordGroupDefinition';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { IconSettings } from 'twenty-ui';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';

export const useGroupDefinitionsFromViewGroups = ({
  viewBarComponentId,
  objectMetadataItem,
}: {
  viewBarComponentId?: string;
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const { currentViewWithSavedFiltersAndSorts } =
    useGetCurrentView(viewBarComponentId);

  const groupDefinitions =
    currentViewWithSavedFiltersAndSorts?.viewGroups
      .map((viewGroup) => {
        const selectFieldMetadataItem = objectMetadataItem.fields.find(
          (field) =>
            field.id === viewGroup.fieldMetadataId &&
            field.type === FieldMetadataType.Select,
        );

        if (!selectFieldMetadataItem) return null;

        if (!selectFieldMetadataItem.options) {
          throw new Error(
            `Select Field ${objectMetadataItem.nameSingular} has no options`,
          );
        }

        const selectedOption = selectFieldMetadataItem.options.find(
          (option) => option.value === viewGroup.fieldValue,
        );

        if (!selectedOption) return null;

        return {
          id: viewGroup.id,
          fieldMetadataId: viewGroup.fieldMetadataId,
          type: RecordGroupDefinitionType.Value,
          title: selectedOption.label,
          value: selectedOption.value,
          color: selectedOption.color,
          position: viewGroup.position,
          // TODO: Properly define actions
          actions: [
            {
              id: 'edit',
              label: 'Edit from Settings',
              icon: IconSettings,
              position: 0,
              callback: () => {
                // navigateToSelectSettings();
              },
            },
          ],
        } as RecordGroupDefinition;
      })
      .filter(isDefined) ?? [];

  return { groupDefinitions };
};
