import { useCallback } from 'react';
import { v4 } from 'uuid';

import { useColumnDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromFieldMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { useCombinedViewFilters } from '@/views/hooks/useCombinedViewFilters';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { isDefined } from '~/utils/isDefined';

type UseHandleToggleTrashColumnFilterProps = {
  objectNameSingular: string;
  viewBarId: string;
};

export const useHandleToggleTrashColumnFilter = ({
  viewBarId,
  objectNameSingular,
}: UseHandleToggleTrashColumnFilterProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { columnDefinitions } =
    useColumnDefinitionsFromFieldMetadata(objectMetadataItem);

  const { upsertCombinedViewFilter } = useCombinedViewFilters(viewBarId);

  const handleToggleTrashColumnFilter = useCallback(() => {
    const trashFieldMetadata = objectMetadataItem.fields.find(
      (field) => field.name === 'deletedAt',
    );

    if (!isDefined(trashFieldMetadata)) return;

    const correspondingColumnDefinition = columnDefinitions.find(
      (columnDefinition) =>
        columnDefinition.fieldMetadataId === trashFieldMetadata.id,
    );

    if (!isDefined(correspondingColumnDefinition)) return;

    const filterType = getFilterTypeFromFieldType(
      correspondingColumnDefinition?.type,
    );

    const newFilter: Filter = {
      id: v4(),
      variant: 'danger',
      fieldMetadataId: trashFieldMetadata.id,
      operand: ViewFilterOperand.IsNotEmpty,
      displayValue: '',
      definition: {
        label: `Deleted ${objectNameSingular}`,
        iconName: 'IconTrash',
        fieldMetadataId: trashFieldMetadata.id,
        type: filterType,
      },
      value: '',
    };

    upsertCombinedViewFilter(newFilter);
  }, [
    columnDefinitions,
    objectMetadataItem.fields,
    objectNameSingular,
    upsertCombinedViewFilter,
  ]);

  return handleToggleTrashColumnFilter;
};
