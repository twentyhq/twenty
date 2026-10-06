import { ObjectFilterDropdownDateInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownDateInput';
import { ObjectFilterDropdownDateTimeInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownDateTimeInput';
import { ObjectFilterDropdownInnerSelectOperandDropdown } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownInnerSelectOperandDropdown';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import {
  type DashboardFilterSlotFilterType,
  ViewFilterOperand,
} from 'twenty-shared/types';
import {
  isDefined,
  isRecordFilterOperandExpectingValue,
} from 'twenty-shared/utils';

type DashboardFilterValueInputProps = {
  filterType: DashboardFilterSlotFilterType;
};

// Picks the value input from the slot type, not from the bound field, so every chart sees the same input.
export const DashboardFilterValueInput = ({
  filterType,
}: DashboardFilterValueInputProps) => {
  const selectedOperandInDropdown = useAtomComponentStateValue(
    selectedOperandInDropdownComponentState,
  );

  const isOperandExpectingValue =
    isDefined(selectedOperandInDropdown) &&
    isRecordFilterOperandExpectingValue(selectedOperandInDropdown);

  if (!isOperandExpectingValue) {
    return <ObjectFilterDropdownInnerSelectOperandDropdown />;
  }

  switch (filterType) {
    case 'DATE':
      return (
        <>
          <ObjectFilterDropdownInnerSelectOperandDropdown />
          <DropdownMenuSeparator />
          <ObjectFilterDropdownDateInput />
        </>
      );
    case 'DATE_TIME':
      return (
        <>
          <ObjectFilterDropdownInnerSelectOperandDropdown />
          <DropdownMenuSeparator />
          {selectedOperandInDropdown === ViewFilterOperand.IS ? (
            <ObjectFilterDropdownDateInput />
          ) : (
            <ObjectFilterDropdownDateTimeInput />
          )}
        </>
      );
    default:
      return <ObjectFilterDropdownInnerSelectOperandDropdown />;
  }
};
