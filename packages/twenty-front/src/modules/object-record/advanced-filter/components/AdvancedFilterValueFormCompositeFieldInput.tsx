import { subFieldNameUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/subFieldNameUsedInDropdownComponentState';
import { FormCountryCodeSelectInput } from '@/object-record/record-field/form-types/components/FormCountryCodeSelectInput';
import { FormCountrySelectInput } from '@/object-record/record-field/form-types/components/FormCountrySelectInput';
import { FormNumberFieldInput } from '@/object-record/record-field/form-types/components/FormNumberFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { JsonValue } from 'type-fest';

export const AdvancedFilterValueFormCompositeFieldInput = ({
  recordFilter,
  onChange,
  VariablePicker,
}: {
  recordFilter: RecordFilter;
  onChange: (newValue: JsonValue) => void;
  VariablePicker?: VariablePickerComponent;
}) => {
  const subFieldNameUsedInDropdown = useRecoilComponentValueV2(
    subFieldNameUsedInDropdownComponentState,
  );

  const filterType = recordFilter.type;

  return (
    <>
      {filterType === 'ADDRESS' ? (
        subFieldNameUsedInDropdown === 'addressCountry' ? (
          <FormCountrySelectInput
            selectedCountryName={recordFilter.value}
            onChange={onChange}
            VariablePicker={VariablePicker}
          />
        ) : (
          <FormTextFieldInput
            defaultValue={recordFilter.value}
            onChange={onChange}
            VariablePicker={VariablePicker}
          />
        )
      ) : filterType === 'CURRENCY' ? (
        recordFilter.subFieldName === 'currencyCode' ? (
          <FormCountryCodeSelectInput
            selectedCountryCode={recordFilter.value}
            onChange={onChange}
            VariablePicker={VariablePicker}
          />
        ) : recordFilter.subFieldName === 'amountMicros' ? (
          <FormNumberFieldInput
            defaultValue={recordFilter.value}
            onChange={onChange}
            VariablePicker={VariablePicker}
          />
        ) : null
      ) : filterType === 'PHONES' ? (
        recordFilter.subFieldName === 'primaryPhoneNumber' ? (
          <FormNumberFieldInput
            defaultValue={recordFilter.value}
            onChange={onChange}
            VariablePicker={VariablePicker}
          />
        ) : (
          <FormTextFieldInput
            defaultValue={recordFilter.value}
            onChange={onChange}
            VariablePicker={VariablePicker}
          />
        )
      ) : (
        <FormTextFieldInput
          defaultValue={recordFilter.value}
          onChange={onChange}
          VariablePicker={VariablePicker}
        />
      )}
    </>
  );
};
