import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { DATE_FILTER_TYPES } from '@/object-record/object-filter-dropdown/constants/DateFilterTypes';
import { DATE_PICKER_DROPDOWN_CONTENT_WIDTH } from '@/object-record/object-filter-dropdown/constants/DatePickerDropdownContentWidth';
import { useApplyObjectFilterDropdownOperand } from '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownOperand';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { subFieldNameUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/subFieldNameUsedInDropdownComponentState';
import { getOperandLabel } from '@/object-record/object-filter-dropdown/utils/getOperandLabel';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { DropdownMenuInnerSelect } from '@/ui/layout/dropdown/components/DropdownMenuInnerSelect';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';
import { SelectOption } from 'twenty-ui/input';

const OBJECT_FILTER_DROPDOWN_INNER_SELECT_OPERAND_DROPDOWN_ID =
  'object-filter-dropdown-inner-select-operand-dropdown';

export const ObjectFilterDropdownInnerSelectOperandDropdown = () => {
  const selectedOperandInDropdown = useRecoilComponentValue(
    selectedOperandInDropdownComponentState,
  );

  const fieldMetadataItemUsedInDropdown = useRecoilComponentValue(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const subFieldNameUsedInDropdown = useRecoilComponentValue(
    subFieldNameUsedInDropdownComponentState,
  );

  const operandsForFilterType = isDefined(fieldMetadataItemUsedInDropdown)
    ? getRecordFilterOperands({
        filterType: getFilterTypeFromFieldType(
          fieldMetadataItemUsedInDropdown.type,
        ),
        subFieldName: subFieldNameUsedInDropdown,
      })
    : [];

  const options = operandsForFilterType.map((operand) => ({
    label: getOperandLabel(operand),
    value: operand,
  })) as SelectOption[];

  const selectedOption =
    options.find((option) => option.value === selectedOperandInDropdown) ??
    options[0];

  const { applyObjectFilterDropdownOperand } =
    useApplyObjectFilterDropdownOperand();

  const handleOperandChange = (newOperandOption: SelectOption) => {
    applyObjectFilterDropdownOperand(
      newOperandOption.value as RecordFilterOperand,
    );
  };

  if (
    !isDefined(selectedOperandInDropdown) ||
    !isDefined(fieldMetadataItemUsedInDropdown)
  ) {
    return null;
  }

  const filterType = getFilterTypeFromFieldType(
    fieldMetadataItemUsedInDropdown.type,
  );

  const isDateFilter = DATE_FILTER_TYPES.includes(filterType);

  const widthInPixels = isDateFilter
    ? DATE_PICKER_DROPDOWN_CONTENT_WIDTH
    : GenericDropdownContentWidth.ExtraLarge;

  return (
    <DropdownMenuInnerSelect
      dropdownId={OBJECT_FILTER_DROPDOWN_INNER_SELECT_OPERAND_DROPDOWN_ID}
      selectedOption={selectedOption}
      onChange={handleOperandChange}
      options={options}
      widthInPixels={widthInPixels}
    />
  );
};
