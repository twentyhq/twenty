import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useComputeRecordRelationFilterDisplayValue } from '@/views/hooks/useComputeRecordRelationFilterDisplayValue';
import { useGetRecordFilterChipLabelValue } from '@/views/hooks/useGetRecordFilterChipLabelValue';

import { isNonEmptyString } from '@sniptt/guards';
import { t } from '@lingui/core/macro';

type ObjectFilterDropdownRecordSelectProps = {
  recordFilter: RecordFilter;
};

// TODO: refactor this with new useGetRecordFilterDisplayValue
export const useComputeRecordRelationFilterLabelValue = ({
  recordFilter,
}: ObjectFilterDropdownRecordSelectProps) => {
  const { getRecordFilterChipLabelValue } = useGetRecordFilterChipLabelValue();

  const { displayValue, loading } = useComputeRecordRelationFilterDisplayValue({
    recordFilter,
  });

  if (loading) {
    return { labelValue: t`: Loading...` };
  }

  return {
    labelValue: isNonEmptyString(displayValue)
      ? getRecordFilterChipLabelValue({
          recordFilter: {
            ...recordFilter,
            displayValue,
          },
        })
      : getRecordFilterChipLabelValue({
          recordFilter,
        }),
  };
};
