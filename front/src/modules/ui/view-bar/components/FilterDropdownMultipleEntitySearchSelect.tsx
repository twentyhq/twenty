import { useEffect, useRef, useState } from 'react';

import { MultipleEntitySelectBase } from '@/ui/input/relation-picker/components/MultipleEntitySelectBase';
import { DropdownMenuSkeletonItem } from '@/ui/input/relation-picker/components/skeletons/DropdownMenuSkeletonItem';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { useRemoveFilter } from '@/ui/view-bar/hooks/useRemoveFilter';
import { useUpsertFilter } from '@/ui/view-bar/hooks/useUpsertFilter';
import { filterDefinitionUsedInDropdownScopedState } from '@/ui/view-bar/states/filterDefinitionUsedInDropdownScopedState';
import { selectedOperandInDropdownScopedState } from '@/ui/view-bar/states/selectedOperandInDropdownScopedState';
import { isNonEmptyString } from '~/utils/isNonEmptyString';

import { useViewBarContext } from '../hooks/useViewBarContext';
import { filterDropdownSearchInputScopedState } from '../states/filterDropdownSearchInputScopedState';

export type EntitiesForMultipleEntitySelect<
  CustomEntityForSelect extends EntityForSelect,
> = {
  selectedEntities: CustomEntityForSelect[];
  filteredSelectedEntities: CustomEntityForSelect[];
  entitiesToSelect: CustomEntityForSelect[];
  loading: boolean;
};

export const FilterDropdownMultipleEntitySearchSelect = <
  CustomEntityForSelect extends EntityForSelect,
>({
  entitiesForSelect,
}: {
  entitiesForSelect: EntitiesForMultipleEntitySelect<CustomEntityForSelect>;
}) => {
  const [entitiesInDropdown, setSetEnitiesInDropdown] =
    useState<(CustomEntityForSelect & { isChecked: boolean })[]>();

  const currentFilterDropdownSearchInput = useRef<string>();

  const { ViewBarRecoilScopeContext } = useViewBarContext();

  const [filterDefinitionUsedInDropdown] = useRecoilScopedState(
    filterDefinitionUsedInDropdownScopedState,
    ViewBarRecoilScopeContext,
  );

  const [selectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    ViewBarRecoilScopeContext,
  );

  const filterDropdownSearchInput = useRecoilScopedValue(
    filterDropdownSearchInputScopedState,
    ViewBarRecoilScopeContext,
  );

  const upsertFilter = useUpsertFilter();
  const removeFilter = useRemoveFilter();

  const handleChange = (entity: EntityForSelect, newCheckedValue: boolean) => {
    if (
      !filterDefinitionUsedInDropdown ||
      !selectedOperandInDropdown ||
      !entitiesInDropdown
    ) {
      return;
    }

    const newEntitiesInDropdown = entitiesInDropdown.map((entityInDropdown) => {
      if (entityInDropdown.id === entity.id) {
        return {
          ...entityInDropdown,
          isChecked: newCheckedValue,
        };
      }
      return entityInDropdown;
    });

    setSetEnitiesInDropdown(newEntitiesInDropdown);

    const selectedEnities = newCheckedValue
      ? [...entitiesForSelect.selectedEntities, entity]
      : entitiesForSelect.selectedEntities.filter(
          (selectedEntity) => selectedEntity.id !== entity.id,
        );

    if (selectedEnities.length === 0) {
      removeFilter(filterDefinitionUsedInDropdown.key);
    } else {
      const selectedEntityIds = selectedEnities.map((entity) => entity.id);

      const displayValue =
        selectedEnities.length === 1
          ? selectedEnities[0].name
          : `${selectedEnities.length} selected`;

      upsertFilter({
        displayValue,
        key: filterDefinitionUsedInDropdown.key,
        operand: selectedOperandInDropdown,
        type: filterDefinitionUsedInDropdown.type,
        value: '',
        multipleValues: selectedEntityIds,
      });
    }
  };

  useEffect(() => {
    if (
      !entitiesForSelect.loading &&
      currentFilterDropdownSearchInput.current !== filterDropdownSearchInput
    ) {
      currentFilterDropdownSearchInput.current = filterDropdownSearchInput;

      setSetEnitiesInDropdown(
        [
          ...entitiesForSelect.filteredSelectedEntities.map((entity) => ({
            ...entity,
            isChecked: true,
          })),
          ...entitiesForSelect.entitiesToSelect.map((entity) => ({
            ...entity,
            isChecked: false,
          })),
        ].filter((entity) => isNonEmptyString(entity.name)),
      );
    }
  }, [
    entitiesForSelect.entitiesToSelect,
    entitiesForSelect.filteredSelectedEntities,
    entitiesForSelect.loading,
    filterDropdownSearchInput,
  ]);

  if (!entitiesInDropdown) return <DropdownMenuSkeletonItem />;

  return (
    <>
      <MultipleEntitySelectBase
        entitiesInDropdown={entitiesInDropdown}
        onChange={handleChange}
      />
    </>
  );
};
