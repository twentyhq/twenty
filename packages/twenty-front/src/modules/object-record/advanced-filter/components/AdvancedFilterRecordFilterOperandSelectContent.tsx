import { DEFAULT_ADVANCED_FILTER_DROPDOWN_SIDE_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownSideOffset';
import { useSetRecordFilterUsedInAdvancedFilterDropdownRow } from '@/object-record/advanced-filter/hooks/useSetRecordFilterUsedInAdvancedFilterDropdownRow';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { useApplyObjectFilterDropdownOperand } from '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownOperand';

import { getOperandLabel } from '@/object-record/object-filter-dropdown/utils/getOperandLabel';
import { useTimeZoneAbbreviationForNowInUserTimeZone } from '@/object-record/record-filter/hooks/useTimeZoneAbbreviationForNowInUserTimeZone';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { Dropdown } from 'twenty-ui/components';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type ViewFilterOperand } from 'twenty-shared/types';

type AdvancedFilterRecordFilterOperandSelectContentProps = {
  recordFilterId: string;
  filter: RecordFilter;
  operandsForFilterType: readonly RecordFilterOperand[];
};

export const AdvancedFilterRecordFilterOperandSelectContent = ({
  recordFilterId,
  filter,
  operandsForFilterType,
}: AdvancedFilterRecordFilterOperandSelectContentProps) => {
  const dropdownId = `advanced-filter-view-filter-operand-${recordFilterId}`;

  const { isWorkflowFindRecords } = useContext(AdvancedFilterContext);

  const { applyObjectFilterDropdownOperand } =
    useApplyObjectFilterDropdownOperand();

  const { setRecordFilterUsedInAdvancedFilterDropdownRow } =
    useSetRecordFilterUsedInAdvancedFilterDropdownRow();

  const handleOperandChange = (operand: ViewFilterOperand) => {
    applyObjectFilterDropdownOperand(operand);
  };

  const handleDropdownOpen = () => {
    setRecordFilterUsedInAdvancedFilterDropdownRow(filter);
  };

  const { userTimeZoneAbbreviation } =
    useTimeZoneAbbreviationForNowInUserTimeZone();

  const { isSystemTimezone } = useUserTimezone();

  const timeZoneAbbreviation =
    isWorkflowFindRecords === true
      ? 'UTC'
      : !isSystemTimezone
        ? userTimeZoneAbbreviation
        : null;

  return (
    <DropdownRoot
      dropdownId={dropdownId}
      type="picker"
      onOpenChange={(open) => {
        if (open) {
          handleDropdownOpen();
        }
      }}
    >
      <Dropdown.Trigger nativeButton={false} render={<div />}>
        <SelectControl
          selectedOption={{
            label: isDefined(filter.operand)
              ? getOperandLabel(filter.operand, timeZoneAbbreviation)
              : t`Select operand`,
            value: null,
          }}
        />
      </Dropdown.Trigger>
      <DropdownContent
        width={160}
        sideOffset={DEFAULT_ADVANCED_FILTER_DROPDOWN_SIDE_OFFSET}
        aria-label={t`Select operand`}
      >
        <Dropdown.Section>
          {operandsForFilterType.map((filterOperand) => (
            <Dropdown.OptionItem
              key={filterOperand}
              selected={filter.operand === filterOperand}
              onSelect={() => handleOperandChange(filterOperand)}
            >
              {getOperandLabel(filterOperand, timeZoneAbbreviation)}
            </Dropdown.OptionItem>
          ))}
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
