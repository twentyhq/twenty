import { AdvancedFilterRecordFilterOperandSelectContent } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterOperandSelectContent';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { getOperandLabel } from '@/object-record/object-filter-dropdown/utils/getOperandLabel';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

type WorkflowAdvancedFilterRecordFilterOperandSelectProps = {
  recordFilterId: string;
};

export const WorkflowAdvancedFilterRecordFilterOperandSelect = ({
  recordFilterId,
}: WorkflowAdvancedFilterRecordFilterOperandSelectProps) => {
  const { readonly } = useContext(AdvancedFilterContext);
  const currentRecordFilters = useRecoilComponentValueV2(
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
      }).filter((operand) => operand !== RecordFilterOperand.IsRelative)
    : [];

  if (isDisabled === true) {
    return (
      <SelectControl
        selectedOption={{
          label: filter?.operand
            ? getOperandLabel(filter.operand)
            : 'Select operand',
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
