import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { useApplyObjectFilterDropdownOperand } from '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownOperand';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { subFieldNameUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/subFieldNameUsedInDropdownComponentState';
import { getOperandLabel } from '@/object-record/object-filter-dropdown/utils/getOperandLabel';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { DropdownMenuInnerSelect } from '@/ui/layout/dropdown/components/DropdownMenuInnerSelect';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-shared/utils';
import { SelectOption } from 'twenty-ui/input';

const OBJECT_FILTER_DROPDOWN_INNER_SELECT_OPERAND_DROPDOWN_ID =
  'object-filter-dropdown-inner-select-operand-dropdown';

export const ObjectFilterDropdownInnerSelectOperandDropdown = () => {
  const selectedOperandInDropdown = useRecoilComponentValueV2(
    selectedOperandInDropdownComponentState,
  );

  const fieldMetadataItemUsedInDropdown = useRecoilComponentValueV2(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const subFieldNameUsedInDropdown = useRecoilComponentValueV2(
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

  if (!isDefined(selectedOperandInDropdown)) {
    return null;
  }

  return (
    <DropdownMenuInnerSelect
      dropdownId={OBJECT_FILTER_DROPDOWN_INNER_SELECT_OPERAND_DROPDOWN_ID}
      selectedOption={selectedOption}
      onChange={handleOperandChange}
      options={options}
    />
  );
};
