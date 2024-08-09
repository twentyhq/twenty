import { useIcons } from 'twenty-ui';

import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { useCombinedViewFilters } from '@/views/hooks/useCombinedViewFilters';
import { useMemo } from 'react';

type VariantFilterChipProps = {
  viewFilter: Filter;
};

export const VariantFilterChip = ({ viewFilter }: VariantFilterChipProps) => {
  const { removeCombinedViewFilter } = useCombinedViewFilters();

  const { getIcon } = useIcons();

  const handleRemoveClick = () => {
    // FixMe: Why it's not working ?
    removeCombinedViewFilter(viewFilter.fieldMetadataId);
  };

  const variant = useMemo(() => {
    switch (viewFilter.variant) {
      case 'trash':
        return 'delete';
      case 'default':
      default:
        return 'default';
    }
  }, [viewFilter.variant]);

  return (
    <SortOrFilterChip
      key={viewFilter.fieldMetadataId}
      testId={viewFilter.fieldMetadataId}
      variant={variant}
      labelValue={viewFilter.definition.label}
      Icon={getIcon(viewFilter.definition.iconName)}
      onRemove={handleRemoveClick}
    />
  );
};
