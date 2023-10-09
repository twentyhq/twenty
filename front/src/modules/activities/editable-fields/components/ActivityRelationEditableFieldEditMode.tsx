import { useCallback, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { useHandleCheckableActivityTargetChange } from '@/activities/hooks/useHandleCheckableActivityTargetChange';
import { currentActivityState } from '@/activities/states/currentActivityState';
import { ActivityTargetableEntityType } from '@/activities/types/ActivityTargetableEntity';
import { flatMapAndSortEntityForSelectArrayOfArrayByName } from '@/activities/utils/flatMapAndSortEntityForSelectArrayByName';
import { useFilteredSearchCompanyQuery } from '@/companies/hooks/useFilteredSearchCompanyQuery';
import { useFilteredSearchPeopleQuery } from '@/people/hooks/useFilteredSearchPeopleQuery';
import { useInlineCell } from '@/ui/inline-cell/hooks/useInlineCell';
import { MultipleEntitySelect } from '@/ui/input/relation-picker/components/MultipleEntitySelect';
import { Activity, ActivityTarget } from '~/generated/graphql';
import { assertNotNull } from '~/utils/assert';

type OwnProps = {
  activity?: Pick<Activity, 'id'> & {
    activityTargets?: Array<
      Pick<ActivityTarget, 'id' | 'personId' | 'companyId'>
    > | null;
  };
};

const StyledSelectContainer = styled.div`
  left: 0px;
  position: absolute;
  top: -8px;
`;

export const ActivityRelationEditableFieldEditMode = ({
  activity,
}: OwnProps) => {
  const [searchFilter, setSearchFilter] = useState('');

  const initialPeopleIds = useMemo(
    () =>
      activity?.activityTargets
        ?.filter((relation) => relation.personId !== null)
        .map((relation) => relation.personId)
        .filter(assertNotNull) ?? [],
    [activity?.activityTargets],
  );

  const initialCompanyIds = useMemo(
    () =>
      activity?.activityTargets
        ?.filter((relation) => relation.companyId !== null)
        .map((relation) => relation.companyId)
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
  const { closeInlineCell: closeEditableField } = useInlineCell();

  const handleSubmit = useCallback(() => {
    handleCheckItemsChange(selectedEntityIds, entitiesToSelect);
    closeEditableField();
  }, [
    handleCheckItemsChange,
    selectedEntityIds,
    entitiesToSelect,
    closeEditableField,
  ]);

  const handleCancel = () => {
    closeEditableField();
  };

  const [, setCurrentActivity] = useRecoilState(currentActivityState);

  const handleSelectEntity = async (
    selectedEntityIds: Record<string, boolean>,
  ) => {
    if (!activity) {
      const entityIds = Object.keys(selectedEntityIds).filter(
        (entityId) => selectedEntityIds[entityId],
      );

      const targetableEntities = entityIds
        .map((id) => ({
          id,
          type: entitiesToSelect.find((entity) => entity.id === id)?.entityType,
        }))
        .filter((target) => target.id && target.type) as {
        id: string;
        type: ActivityTargetableEntityType;
      }[];
      setCurrentActivity((val) => ({
        ...(val ?? {}),
        targetableEntities: [
          ...(val?.targetableEntities ?? []),
          ...targetableEntities,
        ],
      }));
    } else {
      setSelectedEntityIds(selectedEntityIds);
    }
  };

  return (
    <StyledSelectContainer>
      <MultipleEntitySelect
        entities={{
          entitiesToSelect,
          filteredSelectedEntities,
          selectedEntities,
          loading: false,
        }}
        onChange={handleSelectEntity}
        onSearchFilterChange={setSearchFilter}
        searchFilter={searchFilter}
        value={selectedEntityIds}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    </StyledSelectContainer>
  );
};
