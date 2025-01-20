import { useIcons } from 'twenty-ui';

import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useHandleToggleTrashColumnFilter } from '@/object-record/record-index/hooks/useHandleToggleTrashColumnFilter';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { useDeleteCombinedViewFilters } from '@/views/hooks/useDeleteCombinedViewFilters';
import { useParams } from 'react-router-dom';

type VariantFilterChipProps = {
  viewFilter: RecordFilter;
  viewBarId: string;
};

export const VariantFilterChip = ({
  viewFilter,
  viewBarId,
}: VariantFilterChipProps) => {
  const { deleteCombinedViewFilter } = useDeleteCombinedViewFilters();

  const { objectNamePlural } = useParams();

  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural: objectNamePlural ?? '',
  });

  const { toggleSoftDeleteFilterState } = useHandleToggleTrashColumnFilter({
    objectNameSingular,
    viewBarId,
  });

  const { getIcon } = useIcons();

  const handleRemoveClick = () => {
    deleteCombinedViewFilter(viewFilter.id);
    if (
      viewFilter.definition.label === 'Deleted' &&
      viewFilter.operand === 'isNotEmpty'
    ) {
      toggleSoftDeleteFilterState(false);
    }
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
