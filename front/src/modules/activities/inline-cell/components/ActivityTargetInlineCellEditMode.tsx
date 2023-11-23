import { useCallback, useMemo, useState } from 'react';
import styled from '@emotion/styled';

import { useHandleCheckableActivityTargetChange } from '@/activities/hooks/useHandleCheckableActivityTargetChange';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { GraphQLActivity } from '@/activities/types/GraphQLActivity';
import { useInlineCell } from '@/ui/object/record-inline-cell/hooks/useInlineCell';
import { assertNotNull } from '~/utils/assert';

type ActivityTargetInlineCellEditModeProps = {
  activity?: Pick<GraphQLActivity, 'id'> & {
    activityTargets?: {
      edges: Array<{
        node: Pick<ActivityTarget, 'id' | 'personId' | 'companyId'>;
      }> | null;
    };
  };
};

const StyledSelectContainer = styled.div`
  left: 0px;
  position: absolute;
  top: -8px;
`;

export const ActivityTargetInlineCellEditMode = ({
  activity,
}: ActivityTargetInlineCellEditModeProps) => {
  const [searchFilter, setSearchFilter] = useState('');

  const initialPeopleIds = useMemo(
    () =>
      activity?.activityTargets?.edges
        ?.filter(({ node }) => node.personId !== null)
        .map(({ node }) => node.personId)
        .filter(assertNotNull) ?? [],
    [activity?.activityTargets],
  );

  const initialCompanyIds = useMemo(
    () =>
      activity?.activityTargets?.edges
        ?.filter(({ node }) => node.companyId !== null)
        .map(({ node }) => node.companyId)
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

  // const personsForMultiSelect = useFilteredSearchPeopleQuery({
  //   searchFilter,
  //   selectedIds: initialPeopleIds,
  // });

  // const companiesForMultiSelect = useFilteredSearchCompanyQuery({
  //   searchFilter,
  //   selectedIds: initialCompanyIds,
  // });

  // const selectedEntities = flatMapAndSortEntityForSelectArrayOfArrayByName([
  //   personsForMultiSelect.selectedEntities,
  //   companiesForMultiSelect.selectedEntities,
  // ]);

  // const filteredSelectedEntities =
  //   flatMapAndSortEntityForSelectArrayOfArrayByName([
  //     personsForMultiSelect.filteredSelectedEntities,
  //     companiesForMultiSelect.filteredSelectedEntities,
  //   ]);

  // const entitiesToSelect = flatMapAndSortEntityForSelectArrayOfArrayByName([
  //   personsForMultiSelect.entitiesToSelect,
  //   companiesForMultiSelect.entitiesToSelect,
  // ]);

  const handleCheckItemsChange = useHandleCheckableActivityTargetChange({
    activity,
  });
  const { closeInlineCell: closeEditableField } = useInlineCell();

  const handleSubmit = useCallback(() => {
    //handleCheckItemsChange(selectedEntityIds, entitiesToSelect);
    closeEditableField();
  }, [closeEditableField]);

  const handleCancel = () => {
    closeEditableField();
  };

  return (
    <StyledSelectContainer>
      {/* <MultipleEntitySelect
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
      /> */}
    </StyledSelectContainer>
  );
};
