import { useCallback, useState } from 'react';
import styled from '@emotion/styled';

import { useHandleCheckableActivityTargetChange } from '@/activities/hooks/useHandleCheckableActivityTargetChange';
import { ActivityTargetObjectRecord } from '@/activities/types/ActivityTargetObject';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { MultipleEntitySelect } from '@/object-record/relation-picker/components/MultipleEntitySelect';
import { useMultiObjectSearch } from '@/object-record/relation-picker/hooks/useMultiObjectSearch';

const StyledSelectContainer = styled.div`
  left: 0px;
  position: absolute;
  top: -8px;
`;

type ActivityTargetInlineCellEditModeProps = {
  activityId: string;
  activityTargetObjectRecords: ActivityTargetObjectRecord[];
};

export const ActivityTargetInlineCellEditMode = ({
  activityId,
  activityTargetObjectRecords,
}: ActivityTargetInlineCellEditModeProps) => {
  const [searchFilter, setSearchFilter] = useState('');

  // const initialPeopleIds = useMemo(
  //   () =>
  //     activityTargets
  //       ?.filter(({ personId }) => personId !== null)
  //       .map(({ personId }) => personId)
  //       .filter(assertNotNull) ?? [],
  //   [activityTargets],
  // );

  // const initialCompanyIds = useMemo(
  //   () =>
  //     activityTargets
  //       ?.filter(({ companyId }) => companyId !== null)
  //       .map(({ companyId }) => companyId)
  //       .filter(assertNotNull) ?? [],
  //   [activityTargets],
  // );

  // const initialSelectedEntityIds = useMemo(
  //   () =>
  //     [...initialPeopleIds, ...initialCompanyIds].reduce<
  //       Record<string, boolean>
  //     >((result, entityId) => ({ ...result, [entityId]: true }), {}),
  //   [initialPeopleIds, initialCompanyIds],
  // );

  // const { findManyRecordsQuery: findManyPeopleQuery } = useObjectMetadataItem({
  //   objectNameSingular: 'person',
  // });

  // const { findManyRecordsQuery: findManyCompaniesQuery } =
  //   useObjectMetadataItem({
  //     objectNameSingular: 'company',
  //   });

  // const useFindManyPeopleQuery = (options: any) =>
  //   useQuery(findManyPeopleQuery, options);

  // const useFindManyCompaniesQuery = (options: any) =>
  //   useQuery(findManyCompaniesQuery, options);

  // const [selectedEntityIds, setSelectedEntityIds] = useState<
  //   Record<string, boolean>
  // >(initialSelectedEntityIds);

  // const { identifiersMapper, searchQuery } = useRelationPicker();

  // const people = useFilteredSearchEntityQuery({
  //   queryHook: useFindManyPeopleQuery,
  //   filters: [
  //     {
  //       fieldNames: searchQuery?.computeFilterFields?.('person') ?? [],
  //       filter: searchFilter,
  //     },
  //   ],
  //   orderByField: 'createdAt',
  //   mappingFunction: (record: any) => identifiersMapper?.(record, 'person'),
  //   selectedIds: initialPeopleIds,
  //   objectNameSingular: 'person',
  //   limit: 3,
  // });

  // const companies = useFilteredSearchEntityQuery({
  //   queryHook: useFindManyCompaniesQuery,
  //   filters: [
  //     {
  //       fieldNames: searchQuery?.computeFilterFields?.('company') ?? [],
  //       filter: searchFilter,
  //     },
  //   ],
  //   orderByField: 'createdAt',
  //   mappingFunction: (record: any) => identifiersMapper?.(record, 'company'),
  //   selectedIds: initialCompanyIds,
  //   objectNameSingular: 'company',
  //   limit: 3,
  // });

  // const selectedEntities = flatMapAndSortEntityForSelectArrayOfArrayByName([
  //   people.selectedEntities,
  //   companies.selectedEntities,
  // ]);

  // const filteredSelectedEntities =
  //   flatMapAndSortEntityForSelectArrayOfArrayByName([
  //     people.filteredSelectedEntities,
  //     companies.filteredSelectedEntities,
  //   ]);

  // const entitiesToSelect = flatMapAndSortEntityForSelectArrayOfArrayByName([
  //   people.entitiesToSelect,
  //   companies.entitiesToSelect,
  // ]);

  const { selectedObjectRecords } = useMultiObjectSearch({
    searchFilterValue: searchFilter,
    selectedObjectRecordIds: activityTargetObjectRecords.map(
      (activityTarget) => ({
        objectNameSingular:
          activityTarget.targetObjectMetadataItem.nameSingular,
        id: activityTarget.targetObjectRecord.id,
      }),
    ),
    excludedObjectRecordIds: [],
    limit: 3,
  });

  const handleCheckItemsChange = useHandleCheckableActivityTargetChange({
    activityId,
    currentActivityTargets: [],
  });
  const { closeInlineCell: closeEditableField } = useInlineCell();

  const handleSubmit = useCallback(() => {
    // handleCheckItemsChange(
    //   selectedEntityIds,
    //   entitiesToSelect,
    //   selectedEntities,
    // );
    closeEditableField();
  }, [closeEditableField]);

  const handleCancel = () => {
    closeEditableField();
  };

  return (
    <StyledSelectContainer>
      <MultipleEntitySelect
        entities={{
          entitiesToSelect: [],
          filteredSelectedEntities: [],
          selectedEntities: [],
          loading: false,
        }}
        onChange={() => {
          //
        }}
        onSearchFilterChange={setSearchFilter}
        searchFilter={searchFilter}
        value={{}}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    </StyledSelectContainer>
  );
};
