import { useApplyObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownFilterValue';
import { useObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useObjectFilterDropdownFilterValue';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { TextInput } from '@/ui/input/components/TextInput';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

export const AdvancedFilterDropdownNumberInput = () => {
  const selectedOperandInDropdown = useRecoilComponentValue(
    selectedOperandInDropdownComponentState,
  );

  const fieldMetadataItemUsedInDropdown = useRecoilComponentValue(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const { objectFilterDropdownFilterValue } =
    useObjectFilterDropdownFilterValue();

  const { applyObjectFilterDropdownFilterValue } =
    useApplyObjectFilterDropdownFilterValue();

  const handleChange = (newValue: string) => {
    applyObjectFilterDropdownFilterValue(newValue);
  };

  if (!selectedOperandInDropdown || !fieldMetadataItemUsedInDropdown) {
    return null;
  }

  return (
    <TextInput
      value={objectFilterDropdownFilterValue}
      onChange={handleChange}
      placeholder="Enter value"
      fullWidth
      type="number"
    />
  );
};
