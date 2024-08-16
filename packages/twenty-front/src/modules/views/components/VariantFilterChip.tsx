import { useIcons } from 'twenty-ui';

import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { useCombinedViewFilters } from '@/views/hooks/useCombinedViewFilters';

type VariantFilterChipProps = {
  viewFilter: Filter;
};

export const VariantFilterChip = ({ viewFilter }: VariantFilterChipProps) => {
  const { removeCombinedViewFilter } = useCombinedViewFilters();

  const { getIcon } = useIcons();

  const handleRemoveClick = () => {
    removeCombinedViewFilter(viewFilter.id);
  };

  return (
    <SortOrFilterChip
      key={viewFilter.fieldMetadataId}
      testId={viewFilter.fieldMetadataId}
      variant={viewFilter.variant}
      labelValue={viewFilter.definition.label}
      Icon={getIcon(viewFilter.definition.iconName)}
      onRemove={handleRemoveClick}
    />
  );
};
