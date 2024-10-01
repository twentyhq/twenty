import { AdvancedFilterQuery } from '@/object-record/object-filter-dropdown/types/AdvancedFilterQuery';

type AdvancedFilterQueryBuilderProps = {
  advancedFilterQuery?: AdvancedFilterQuery | null;
  onChange: (advancedFilterQuery: AdvancedFilterQuery) => void;
};

export const AdvancedFilterQueryBuilder = ({
  advancedFilterQuery,
}: AdvancedFilterQueryBuilderProps) => {
  return <div>TODO - Current value: {JSON.stringify(advancedFilterQuery)}</div>;
};
