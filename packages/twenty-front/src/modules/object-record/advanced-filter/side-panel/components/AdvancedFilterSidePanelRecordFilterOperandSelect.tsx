import { AdvancedFilterRecordFilterOperandSelectContent } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterOperandSelectContent';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { getOperandLabel } from '@/object-record/object-filter-dropdown/utils/getOperandLabel';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { useLingui } from '@lingui/react/macro';

type AdvancedFilterSidePanelRecordFilterOperandSelectProps = {
  recordFilterId: string;
};

export const AdvancedFilterSidePanelRecordFilterOperandSelect = ({
  recordFilterId,
}: AdvancedFilterSidePanelRecordFilterOperandSelectProps) => {
  const { t } = useLingui();
  const { readonly, isWorkflowFindRecords } = useContext(AdvancedFilterContext);
  const currentRecordFilters = useAtomComponentStateValue(
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
  const timeZoneAbbreviation = shouldUseUTCTimeZone
    ? doNotTranslate('UTC')
    : undefined;

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
