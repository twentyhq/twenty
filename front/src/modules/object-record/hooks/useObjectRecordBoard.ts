import { useRecoilValue } from 'recoil';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { turnFiltersIntoWhereClause } from '@/ui/object/object-filter-dropdown/utils/turnFiltersIntoWhereClause';
import { turnSortsIntoOrderBy } from '@/ui/object/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { useRecordBoardScopedStates } from '@/ui/object/record-board/hooks/internal/useRecordBoardScopedStates';
import { useRecordBoard } from '@/ui/object/record-board/hooks/useRecordBoard';

import { getRecordOptimisticEffectDefinition } from '../graphql/optimistic-effect-definition/getRecordOptimisticEffectDefinition';

import { useFindManyRecords } from './useFindManyRecords';

export const useObjectRecordBoard = () => {
  const { scopeId: objectNamePlural, setRecordBoardData } = useRecordBoard();

  const { objectMetadataItem: foundObjectMetadataItem } = useObjectMetadataItem(
    {
      objectNamePlural,
    },
  );

  const { registerOptimisticEffect } = useOptimisticEffect({
    objectNameSingular: foundObjectMetadataItem?.nameSingular,
  });

  const { boardFiltersState, boardSortsState } = useRecordBoardScopedStates();

  const boardFilters = useRecoilValue(boardFiltersState);
  const boardSorts = useRecoilValue(boardSortsState);

  const filter = turnFiltersIntoWhereClause(
    boardFilters,
    foundObjectMetadataItem?.fields ?? [],
  );
  const orderBy = turnSortsIntoOrderBy(
    boardSorts,
    foundObjectMetadataItem?.fields ?? [],
  );

  const { records, loading, fetchMoreRecords } = useFindManyRecords({
    objectNamePlural,
    filter,
    orderBy,
    onCompleted: (data) => {
      const entities = data.edges.map((edge) => edge.node) ?? [];

      setRecordBoardData(entities);

      if (foundObjectMetadataItem) {
        registerOptimisticEffect({
          variables: { orderBy, filter, limit: 60 },
          definition: getRecordOptimisticEffectDefinition({
            objectMetadataItem: foundObjectMetadataItem,
          }),
        });
      }
    },
  });

  return {
    records,
    loading,
    fetchMoreRecords,
  };
};
