import { useCallback, useEffect } from 'react';

import { pipelineSteps } from '@/companies/__stories__/mock-data';
import { useUpdateCompanyBoardCardIds } from '@/companies/hooks/useUpdateCompanyBoardCardIds';
import { useUpdateCompanyBoard } from '@/companies/hooks/useUpdateCompanyBoardColumns';
import { Company } from '@/companies/types/Company';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { PaginatedRecordTypeResults } from '@/object-record/types/PaginatedRecordTypeResults';
import { Opportunity } from '@/pipeline/types/Opportunity';
import { turnFiltersIntoWhereClause } from '@/ui/object/object-filter-dropdown/utils/turnFiltersIntoWhereClause';
import { turnSortsIntoOrderBy } from '@/ui/object/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { useBoardContext } from '@/ui/object/record-board/hooks/useBoardContext';
import { useRecordBoard } from '@/ui/object/record-board/hooks/useRecordBoard';
import { boardCardFieldsFamilyState } from '@/ui/object/record-board/states/boardCardFieldsFamilyState';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { mapViewSortsToSorts } from '@/views/utils/mapViewSortsToSorts';
import { isDefined } from '~/utils/isDefined';

export const RecordBoardInternalEffect = () => {
  const { setIsBoardLoaded } = useRecordBoard({
    recordTableScopeId: recordBoardId,
  });

  const { BoardRecoilScopeContext } = useBoardContext();

  const [, setBoardCardFields] = useRecoilScopedState(
    boardCardFieldsFamilyState,
    BoardRecoilScopeContext,
  );

  const updateCompanyBoardCardIds = useUpdateCompanyBoardCardIds();
  const updateCompanyBoard = useUpdateCompanyBoard();

  const filter = turnFiltersIntoWhereClause(
    mapViewFiltersToFilters(currentViewFilters),
    objectMetadataItem?.fields ?? [],
  );

  const orderBy = turnSortsIntoOrderBy(
    mapViewSortsToSorts(currentViewSorts),
    objectMetadataItem?.fields ?? [],
  );

  const { fetchMoreRecords: fetchMoreOpportunities } = useFindManyRecords({
    skip: !pipelineSteps.length,
    objectNamePlural: 'opportunities',
    filter: filter,
    orderBy: orderBy,
    onCompleted: useCallback(
      (data: PaginatedRecordTypeResults<Opportunity>) => {
        const pipelineProgresses: Array<Opportunity> = data.edges.map(
          (edge) => edge.node,
        );

        updateCompanyBoardCardIds(pipelineProgresses);

        setOpportunities(pipelineProgresses);
        setIsBoardLoaded(true);
      },
      [setIsBoardLoaded, updateCompanyBoardCardIds],
    ),
  });
  useEffect(() => {
    if (isDefined(fetchMoreOpportunities)) {
      fetchMoreOpportunities();
    }
  }, [fetchMoreOpportunities]);

  const { fetchMoreRecords: fetchMoreCompanies } = useFindManyRecords({
    skip: !opportunities.length,
    objectNamePlural: 'companies',
    filter: {
      id: {
        in: opportunities.map((opportunity) => opportunity.companyId || ''),
      },
    },
    onCompleted: useCallback((data: PaginatedRecordTypeResults<Company>) => {
      setCompanies(data.edges.map((edge) => edge.node));
    }, []),
  });

  useEffect(() => {
    if (isDefined(fetchMoreCompanies)) {
      fetchMoreCompanies();
    }
  }, [fetchMoreCompanies]);

  return <></>;
};
