import {
  EntitiesForMultipleEntitySelect,
  MultipleEntitySelectBase,
} from '@/ui/input/relation-picker/components/MultipleEntitySelectBase';
import { DropdownMenuSkeletonItem } from '@/ui/input/relation-picker/components/skeletons/DropdownMenuSkeletonItem';
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

  const handleChange = (entity: EntityForSelect, newCheckedValue: boolean) => {
    if (!filterDefinitionUsedInDropdown || !selectedOperandInDropdown) {
      return;
    }

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

  if (entitiesForSelect.loading) return <DropdownMenuSkeletonItem />;

  return (
    <>
      <MultipleEntitySelectBase
        entitiesForSelect={entitiesForSelect}
        onChange={handleChange}
      />
    </>
  );
};
