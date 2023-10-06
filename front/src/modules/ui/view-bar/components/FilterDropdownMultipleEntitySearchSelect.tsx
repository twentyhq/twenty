import { useState } from 'react';

import {
  EntitiesForMultipleEntitySelect,
  MultipleEntitySelectBase,
} from '@/ui/input/relation-picker/components/MultipleEntitySelectBase';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRemoveFilter } from '@/ui/view-bar/hooks/useRemoveFilter';
import { useUpsertFilter } from '@/ui/view-bar/hooks/useUpsertFilter';
import { filterDefinitionUsedInDropdownScopedState } from '@/ui/view-bar/states/filterDefinitionUsedInDropdownScopedState';
import { selectedOperandInDropdownScopedState } from '@/ui/view-bar/states/selectedOperandInDropdownScopedState';

import { useViewBarContext } from '../hooks/useViewBarContext';

export const FilterDropdownMultipleEntitySearchSelect = <
  CustomEntityForSelect extends EntityForSelect,
>({
  entitiesForSelect,
}: {
  entitiesForSelect: EntitiesForMultipleEntitySelect<CustomEntityForSelect>;
}) => {
  const { ViewBarRecoilScopeContext } = useViewBarContext();

  const [selectedEntities, setSelectedEntities] = useState<
    (CustomEntityForSelect & { isChecked: boolean })[]
  >(() => [
    ...entitiesForSelect.selectedEntities.map((entity) => ({
      ...entity,
      isChecked: true,
    })),
    ...entitiesForSelect.entitiesToSelect.map((entity) => ({
      ...entity,
      isChecked: false,
    })),
  ]);

  const [selectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    ViewBarRecoilScopeContext,
  );

  const [filterDefinitionUsedInDropdown] = useRecoilScopedState(
    filterDefinitionUsedInDropdownScopedState,
    ViewBarRecoilScopeContext,
  );

  const upsertFilter = useUpsertFilter();
  const removeFilter = useRemoveFilter();

  const handleChange = (entityId: string, newCheckedValue: boolean) => {
    setSelectedEntities((previousSelectedEntities) =>
      previousSelectedEntities.map((previousSelectedEntity) => {
        if (previousSelectedEntity.id === entityId) {
          return {
            ...previousSelectedEntity,
            isChecked: newCheckedValue,
          };
        }
        return previousSelectedEntity;
      }),
    );
  };

  const handleSubmit = () => {
    if (!filterDefinitionUsedInDropdown || !selectedOperandInDropdown) {
      return;
    }

    const selectedIds = selectedEntities.reduce<string[]>((result, entity) => {
      if (entity.isChecked) {
        result.push(entity.id);
      }
      return result;
    }, []);

    if (selectedIds.length === 0) {
      removeFilter(filterDefinitionUsedInDropdown.key);
    } else {
      const selectedEntityNames = selectedEntities.reduce<string[]>(
        (result, entity) => {
          if (entity.isChecked) {
            result.push(entity.name);
          }
          return result;
        },
        [],
      );

      const displayValue =
        selectedEntityNames.length === 1
          ? selectedEntityNames[0]
          : `${selectedEntityNames.length} selected`;

      upsertFilter({
        displayValue: displayValue,
        key: filterDefinitionUsedInDropdown.key,
        operand: selectedOperandInDropdown,
        type: filterDefinitionUsedInDropdown.type,
        value: '',
        multipleValues: selectedIds,
      });
    }
  };

  return (
    <>
      <MultipleEntitySelectBase
        entities={entitiesForSelect}
        onChange={handleChange}
        onSubmit={handleSubmit}
        selectedEntityIds={selectedEntities}
      />
    </>
  );
};
