import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useGetRecordIndexTotalCount } from '@/views/hooks/internal/useGetRecordIndexTotalCount';
import { type ViewFilter } from '@/views/types/ViewFilter';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { isDefined } from 'twenty-shared/utils';
import { Badge } from 'twenty-ui/primitives/data-display';

type RecordIndexCustomTabCountProps = {
  viewFilters: ViewFilter[];
};

export const RecordIndexCustomTabCount = ({
  viewFilters,
}: RecordIndexCustomTabCountProps) => {
  const { formatNumber } = useNumberFormat();

  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );

  const { totalCount } = useGetRecordIndexTotalCount({
    additionalRecordFilters: mapViewFiltersToFilters(
      viewFilters,
      flattenedFieldMetadataItems,
    ),
  });

  if (!isDefined(totalCount)) {
    return null;
  }

  return <Badge>{formatNumber(totalCount)}</Badge>;
};
