import { useCallback } from 'react';

import { useColumnDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromFieldMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { getOperandsForFilterType } from '@/object-record/object-filter-dropdown/utils/getOperandsForFilterType';
import { useDropdownRemotely } from '@/ui/layout/dropdown/hooks/useDropdownRemotely';
import { useCombinedViewFilters } from '@/views/hooks/useCombinedViewFilters';
import { isDefined } from '~/utils/isDefined';

type UseHandleToggleColumnFilterProps = {
  objectNameSingular: string;
  viewBarId: string;
};

export const useHandleToggleColumnFilter = ({
  viewBarId,
  objectNameSingular,
}: UseHandleToggleColumnFilterProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { columnDefinitions } =
    useColumnDefinitionsFromFieldMetadata(objectMetadataItem);

  const { upsertCombinedViewFilter } = useCombinedViewFilters(viewBarId);
  const { openDropdownRemotely } = useDropdownRemotely();

  const handleToggleColumnFilter = useCallback(
    (fieldMetadataId: string) => {
      const correspondingColumnDefinition = columnDefinitions.find(
        (columnDefinition) =>
          columnDefinition.fieldMetadataId === fieldMetadataId,
      );

      if (!isDefined(correspondingColumnDefinition)) return;

      const filterType = getFilterTypeFromFieldType(
        correspondingColumnDefinition?.type,
      );

      const availableOperandsForFilter = getOperandsForFilterType(filterType);

      const defaultOperand = availableOperandsForFilter[0];

      const newFilter: Filter = {
        fieldMetadataId,
        operand: defaultOperand,
        displayValue: '',
        definition: {
          label: correspondingColumnDefinition.label,
          iconName: correspondingColumnDefinition.iconName,
          fieldMetadataId,
          type: filterType,
        },
        value: '',
      };

      upsertCombinedViewFilter(newFilter);

      openDropdownRemotely(fieldMetadataId, {
        scope: fieldMetadataId,
      });
    },
    [columnDefinitions, upsertCombinedViewFilter, openDropdownRemotely],
  );

  return handleToggleColumnFilter;
};
