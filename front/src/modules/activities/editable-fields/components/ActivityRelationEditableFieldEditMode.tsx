import { useCallback, useMemo, useState } from 'react';
import styled from '@emotion/styled';

import { useHandleCheckableActivityTargetChange } from '@/activities/hooks/useHandleCheckableActivityTargetChange';
import { flatMapAndSortEntityForSelectArrayOfArrayByName } from '@/activities/utils/flatMapAndSortEntityForSelectArrayByName';
import { useFilteredSearchCompanyQuery } from '@/companies/queries';
import { useFilteredSearchPeopleQuery } from '@/people/queries';
import { useEditableField } from '@/ui/editable-field/hooks/useEditableField';
import { MultipleEntitySelect } from '@/ui/relation-picker/components/MultipleEntitySelect';
import { Activity, ActivityTarget } from '~/generated/graphql';
import { assertNotNull } from '~/utils/assert';

type OwnProps = {
  activity?: Pick<Activity, 'id'> & {
    activityTargets?: Array<
      Pick<ActivityTarget, 'id' | 'commentableId' | 'commentableType'>
    > | null;
  };
};

const StyledSelectContainer = styled.div`
  left: 0px;
  position: absolute;
  top: -8px;
`;

export function ActivityRelationEditableFieldEditMode({ activity }: OwnProps) {
  const [searchFilter, setSearchFilter] = useState('');

  const initialPeopleIds = useMemo(
    () =>
      activity?.activityTargets
        ?.filter((relation) => relation.commentableType === 'Person')
        .map((relation) => relation.commentableId)
        .filter(assertNotNull) ?? [],
    [activity?.activityTargets],
  );

  const initialCompanyIds = useMemo(
    () =>
      activity?.activityTargets
        ?.filter((relation) => relation.commentableType === 'Company')
        .map((relation) => relation.commentableId)
        .filter(assertNotNull) ?? [],
    [activity?.activityTargets],
  );

  const initialSelectedEntityIds = useMemo(
    () =>
      [...initialPeopleIds, ...initialCompanyIds].reduce<
        Record<string, boolean>
      >((result, entityId) => ({ ...result, [entityId]: true }), {}),
    [initialPeopleIds, initialCompanyIds],
  );

  const [selectedEntityIds, setSelectedEntityIds] = useState<
    Record<string, boolean>
  >(initialSelectedEntityIds);

  const personsForMultiSelect = useFilteredSearchPeopleQuery({
    searchFilter,
    selectedIds: initialPeopleIds,
  });

  const companiesForMultiSelect = useFilteredSearchCompanyQuery({
    searchFilter,
    selectedIds: initialCompanyIds,
  });

  const selectedEntities = flatMapAndSortEntityForSelectArrayOfArrayByName([
    personsForMultiSelect.selectedEntities,
    companiesForMultiSelect.selectedEntities,
  ]);

  const filteredSelectedEntities =
    flatMapAndSortEntityForSelectArrayOfArrayByName([
      personsForMultiSelect.filteredSelectedEntities,
      companiesForMultiSelect.filteredSelectedEntities,
    ]);

  const entitiesToSelect = flatMapAndSortEntityForSelectArrayOfArrayByName([
    personsForMultiSelect.entitiesToSelect,
    companiesForMultiSelect.entitiesToSelect,
  ]);

  const handleCheckItemsChange = useHandleCheckableActivityTargetChange({
    activity,
  });
  const { closeEditableField } = useEditableField();

  const handleSubmit = useCallback(() => {
    handleCheckItemsChange(selectedEntityIds, entitiesToSelect);
    closeEditableField();
  }, [
    handleCheckItemsChange,
    selectedEntityIds,
    entitiesToSelect,
    closeEditableField,
  ]);

  function handleCancel() {
    closeEditableField();
  }

  return (
    <StyledSelectContainer>
      <MultipleEntitySelect
        entities={{
          entitiesToSelect,
          filteredSelectedEntities,
          selectedEntities,
          loading: false,
        }}
        onChange={setSelectedEntityIds}
        onSearchFilterChange={setSearchFilter}
        searchFilter={searchFilter}
        value={selectedEntityIds}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    </StyledSelectContainer>
  );
}
