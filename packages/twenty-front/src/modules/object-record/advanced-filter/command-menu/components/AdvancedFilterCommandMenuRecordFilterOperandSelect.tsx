import { AdvancedFilterRecordFilterOperandSelectContent } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterOperandSelectContent';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { getOperandLabel } from '@/object-record/object-filter-dropdown/utils/getOperandLabel';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

type AdvancedFilterCommandMenuRecordFilterOperandSelectProps = {
  recordFilterId: string;
};

export const AdvancedFilterCommandMenuRecordFilterOperandSelect = ({
  recordFilterId,
}: AdvancedFilterCommandMenuRecordFilterOperandSelectProps) => {
  const { readonly, isWorkflowFindRecords } = useContext(AdvancedFilterContext);
  const currentRecordFilters = useRecoilComponentValue(
    currentRecordFiltersComponentState,
  );

  const filter = currentRecordFilters.find(
    (recordFilter) => recordFilter.id === recordFilterId,
  );

  const isDisabled = !filter?.fieldMetadataId || readonly;

  const filterType = filter?.type;

  const operandsForFilterType = isDefined(filterType)
    ? getRecordFilterOperands({
        filterType,
        subFieldName: filter?.subFieldName,
      })
    : [];

  const shouldUseUTCTimeZone = isWorkflowFindRecords === true;
  const timeZoneAbbreviation = shouldUseUTCTimeZone ? 'UTC' : undefined;

  if (isDisabled === true) {
    return (
      <SelectControl
        selectedOption={{
          label: filter?.operand
            ? getOperandLabel(filter.operand, timeZoneAbbreviation)
            : t`Select operand`,
          value: null,
        }}
        isDisabled
      />
    );
  }

  return (
    <AdvancedFilterRecordFilterOperandSelectContent
      recordFilterId={recordFilterId}
      filter={filter}
      operandsForFilterType={operandsForFilterType}
    />
  );
};
