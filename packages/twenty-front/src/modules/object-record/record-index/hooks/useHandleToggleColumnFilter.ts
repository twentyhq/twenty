import { useCallback } from 'react';
import { v4 } from 'uuid';

import { useColumnDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromFieldMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { getOperandsForFilterDefinition } from '@/object-record/object-filter-dropdown/utils/getOperandsForFilterType';
import { useUpsertCombinedViewFilters } from '@/views/hooks/useUpsertCombinedViewFilters';
import { isDefined } from '~/utils/isDefined';
import { useFilterDropdownWithUnknownScope } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdownWithUnknownScope';
import { useRecoilCallback } from 'recoil';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';

type UseHandleToggleColumnFilterProps = {
  objectNameSingular: string;
  viewBarId: string;
};

export const useHandleToggleColumnFilter = ({
  objectNameSingular,
  viewBarId,
}: UseHandleToggleColumnFilterProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { columnDefinitions } =
    useColumnDefinitionsFromFieldMetadata(objectMetadataItem);

  const { upsertCombinedViewFilter } = useUpsertCombinedViewFilters(viewBarId);

  const openDropdown = useRecoilCallback(
    ({ set }) => {
      return (dropdownId: string) => {
        const dropdownOpenState = extractComponentState(
          isDropdownOpenComponentState,
          dropdownId,
        );

        set(dropdownOpenState, true);
      };
    },
    [isDropdownOpenComponentState],
  );

  /* const availableFilterDefinitions = useRecoilComponentValueV2(
    availableFilterDefinitionsComponentState,
  ); */

  const { setFilterDefinitionUsedInDropdown } =
    useFilterDropdownWithUnknownScope();

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

      setFilterDefinitionUsedInDropdown(newFilter.id, filterDefinition);

      // TODO: Remove timeout
      setTimeout(() => {
        openDropdown(newFilter.id);
      }, 1);
    },
    [
      openDropdown,
      columnDefinitions,
      upsertCombinedViewFilter,
      setFilterDefinitionUsedInDropdown,
    ],
  );

  return handleToggleColumnFilter;
};
