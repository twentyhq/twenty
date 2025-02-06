import { useIcons } from 'twenty-ui';

import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useHandleToggleTrashColumnFilter } from '@/object-record/record-index/hooks/useHandleToggleTrashColumnFilter';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { useDeleteCombinedViewFilters } from '@/views/hooks/useDeleteCombinedViewFilters';
import { useParams } from 'react-router-dom';

type VariantFilterChipProps = {
  recordFilter: RecordFilter;
  viewBarId: string;
};

export const VariantFilterChip = ({
  recordFilter,
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

  const { fieldMetadataItem } = useFieldMetadataItemById(
    recordFilter.fieldMetadataId,
  );

  const { removeRecordFilter } = useRemoveRecordFilter();

  const { getIcon } = useIcons();

  const FieldMetadataItemIcon = getIcon(fieldMetadataItem.icon);

  const handleRemoveClick = () => {
    deleteCombinedViewFilter(recordFilter.id);
    removeRecordFilter(recordFilter.fieldMetadataId);

    if (
      recordFilter.label === 'Deleted' &&
      recordFilter.operand === 'isNotEmpty'
    ) {
      toggleSoftDeleteFilterState(false);
    }
  };

  return (
    <SortOrFilterChip
      key={recordFilter.fieldMetadataId}
      testId={recordFilter.fieldMetadataId}
      variant={recordFilter.variant}
      labelValue={recordFilter.label ?? ''}
      Icon={FieldMetadataItemIcon}
      onRemove={handleRemoveClick}
    />
  );
};
