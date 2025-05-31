import { TSVectorFilter } from '@/object-record/graphql/types/RecordGqlOperationFilter';

export const isMatchingTSVectorFilter = ({
  tsVectorFilter,
  value,
}: {
  tsVectorFilter: TSVectorFilter;
  value: string;
}) => {
  switch (true) {
    case tsVectorFilter.search !== undefined: {
      const searchQuery = tsVectorFilter.search.toLowerCase();
      const searchValue = value.toLowerCase();
      const searchWords = searchQuery.split(/\s+/).filter(Boolean);
      return searchWords.every((word) => searchValue.includes(word));
    }
    default: {
      throw new Error(
        `Unexpected value for ts_vector filter : ${JSON.stringify(tsVectorFilter)}`,
      );
    }
  }
};
