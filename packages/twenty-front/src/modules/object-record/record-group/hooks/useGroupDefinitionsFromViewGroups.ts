import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getObjectSlug } from '@/object-metadata/utils/getObjectSlug';
import {
  RecordGroupDefinition,
  RecordGroupDefinitionNoValue,
  RecordGroupDefinitionType,
} from '@/object-record/record-group/types/RecordGroupDefinition';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
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
  let containNullableFieldMetadata = false;

  const { currentViewWithSavedFiltersAndSorts } =
    useGetCurrentView(viewBarComponentId);

  const navigate = useNavigate();
  const location = useLocation();
  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );
  const navigateToSelectSettings = useCallback(() => {
    setNavigationMemorizedUrl(location.pathname + location.search);
    navigate(`/settings/objects/${getObjectSlug(objectMetadataItem)}`);
  }, [
    navigate,
    objectMetadataItem,
    location.pathname,
    location.search,
    setNavigationMemorizedUrl,
  ]);

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

        if (selectFieldMetadataItem.isNullable === true) {
          containNullableFieldMetadata = true;
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
          actions: [
            {
              id: 'edit',
              label: 'Edit from Settings',
              icon: IconSettings,
              position: 0,
              callback: () => {
                navigateToSelectSettings();
              },
            },
          ],
        } satisfies RecordGroupDefinition;
      })
      .filter(isDefined)
      .sort((a, b) => a.position - b.position) ?? [];

  const noValueColumn = {
    id: 'no-value',
    title: 'No Value',
    type: RecordGroupDefinitionType.NoValue,
    value: null,
    actions: [],
    position:
      groupDefinitions
        .map((option) => option.position)
        .reduce((a, b) => Math.max(a, b), 0) + 1,
  } satisfies RecordGroupDefinitionNoValue;

  if (!containNullableFieldMetadata) {
    return { groupDefinitions };
  }

  return { groupDefinitions: [...groupDefinitions, noValueColumn] };
};
