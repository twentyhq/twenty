import { useCallback } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { Company } from '@/companies/types/Company';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { useRecordBoardDeprecatedScopedStates } from '@/object-record/record-board-deprecated/hooks/internal/useRecordBoardDeprecatedScopedStates';
import { turnObjectDropdownFilterIntoQueryFilter } from '@/object-record/record-filter/utils/turnObjectDropdownFilterIntoQueryFilter';
import { ObjectRecordConnection } from '@/object-record/types/ObjectRecordConnection';
import { Opportunity } from '@/pipeline/types/Opportunity';
import { PipelineStep } from '@/pipeline/types/PipelineStep';

import { useFindManyRecords } from './useFindManyRecords';

export const useObjectRecordBoardDeprecated = () => {
  const objectNameSingular = 'opportunity';

  const { objectMetadataItem: foundObjectMetadataItem } = useObjectMetadataItem(
    {
      objectNameSingular,
    },
  );

  const {
    isBoardLoadedState,
    boardFiltersState,
    boardSortsState,
    savedCompaniesState,
    savedOpportunitiesState,
    savedPipelineStepsState,
  } = useRecordBoardDeprecatedScopedStates();

  const setIsBoardLoaded = useSetRecoilState(isBoardLoadedState);

  const boardFilters = useRecoilValue(boardFiltersState);
  const boardSorts = useRecoilValue(boardSortsState);

  const setSavedCompanies = useSetRecoilState(savedCompaniesState);

  const [savedOpportunities] = useRecoilState(savedOpportunitiesState);

  const [savedPipelineSteps, setSavedPipelineSteps] = useRecoilState(
    savedPipelineStepsState,
  );

  const filter = turnObjectDropdownFilterIntoQueryFilter(
    boardFilters,
    foundObjectMetadataItem?.fields ?? [],
  );
  const orderBy = turnSortsIntoOrderBy(
    boardSorts,
    foundObjectMetadataItem?.fields ?? [],
  );

  useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.PipelineStep,
    filter,
    onCompleted: useCallback(
      (data: ObjectRecordConnection<PipelineStep>) => {
        setSavedPipelineSteps(data.edges.map((edge) => edge.node));
      },
      [setSavedPipelineSteps],
    ),
  });

  const {
    records: opportunities,
    loading,
    fetchMoreRecords: fetchMoreOpportunities,
  } = useFindManyRecords<Opportunity>({
    skip: !savedPipelineSteps.length,
    objectNameSingular: CoreObjectNameSingular.Opportunity,
    filter,
    orderBy,
    onCompleted: useCallback(() => {
      setIsBoardLoaded(true);
    }, [setIsBoardLoaded]),
  });

  const { fetchMoreRecords: fetchMoreCompanies } = useFindManyRecords({
    skip: !savedOpportunities.length,
    objectNameSingular: CoreObjectNameSingular.Company,
    filter: {
      id: {
        in: savedOpportunities.map(
          (opportunity) => opportunity.companyId || '',
        ),
      },
    },
    onCompleted: useCallback(
      (data: ObjectRecordConnection<Company>) => {
        setSavedCompanies(data.edges.map((edge) => edge.node));
      },
      [setSavedCompanies],
    ),
  });

  return {
    opportunities,
    loading,
    fetchMoreOpportunities,
    fetchMoreCompanies,
  };
};
