import { useCallback } from 'react';
import { v4 } from 'uuid';

import { useColumnDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromFieldMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { getOperandsForFilterDefinition } from '@/object-record/object-filter-dropdown/utils/getOperandsForFilterType';
import { useDropdownV2 } from '@/ui/layout/dropdown/hooks/useDropdownV2';
import { useUpsertCombinedViewFilters } from '@/views/hooks/useUpsertCombinedViewFilters';
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

  const { upsertCombinedViewFilter } = useUpsertCombinedViewFilters(viewBarId);
  const { openDropdown } = useDropdownV2();

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

      const filterDefinition = {
        label: correspondingColumnDefinition.label,
        iconName: correspondingColumnDefinition.iconName,
        fieldMetadataId,
        type: filterType,
      } satisfies FilterDefinition;

      const availableOperandsForFilter =
        getOperandsForFilterDefinition(filterDefinition);

      const defaultOperand = availableOperandsForFilter[0];

      const newFilter: Filter = {
        id: v4(),
        fieldMetadataId,
        operand: defaultOperand,
        displayValue: '',
        definition: filterDefinition,
        value: '',
      };

      upsertCombinedViewFilter(newFilter);

      openDropdown(newFilter.id, {
        scope: newFilter.id,
      });
    },
    [columnDefinitions, upsertCombinedViewFilter, openDropdown],
  );

  return handleToggleColumnFilter;
};
