import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { subFieldNameUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/subFieldNameUsedInDropdownComponentState';
import { FormCountryMultiSelectInput } from '@/object-record/record-field/form-types/components/FormCountryMultiSelectInput';
import { FormMultiSelectFieldInput } from '@/object-record/record-field/form-types/components/FormMultiSelectFieldInput';
import { FormNumberFieldInput } from '@/object-record/record-field/form-types/components/FormNumberFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { CURRENCIES } from '@/settings/data-model/constants/Currencies';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { useContext } from 'react';
import { JsonValue } from 'type-fest';

export const WorkflowAdvancedFilterValueFormCompositeFieldInput = ({
  recordFilter,
  onChange,
}: {
  recordFilter: RecordFilter;
  onChange: (newValue: JsonValue) => void;
}) => {
  const subFieldNameUsedInDropdown = useRecoilComponentValue(
    subFieldNameUsedInDropdownComponentState,
  );

  const filterType = recordFilter.type;

  const { readonly } = useContext(AdvancedFilterContext);

  return (
    <>
      {filterType === 'ADDRESS' ? (
        subFieldNameUsedInDropdown === 'addressCountry' ? (
          <FormCountryMultiSelectInput
            defaultValue={recordFilter.value}
            onChange={onChange}
            VariablePicker={WorkflowVariablePicker}
            readonly={readonly}
          />
        ) : (
          <FormTextFieldInput
            defaultValue={recordFilter.value}
            onChange={onChange}
            VariablePicker={WorkflowVariablePicker}
            readonly={readonly}
          />
        )
      ) : filterType === 'CURRENCY' ? (
        recordFilter.subFieldName === 'currencyCode' ? (
          <FormMultiSelectFieldInput
            defaultValue={recordFilter.value}
            onChange={onChange}
            VariablePicker={WorkflowVariablePicker}
            options={CURRENCIES}
            readonly={readonly}
          />
        ) : recordFilter.subFieldName === 'amountMicros' ? (
          <FormNumberFieldInput
            defaultValue={recordFilter.value}
            onChange={onChange}
            VariablePicker={WorkflowVariablePicker}
            readonly={readonly}
          />
        ) : null
      ) : filterType === 'PHONES' ? (
        recordFilter.subFieldName === 'primaryPhoneNumber' ? (
          <FormNumberFieldInput
            defaultValue={recordFilter.value}
            onChange={onChange}
            VariablePicker={WorkflowVariablePicker}
            readonly={readonly}
          />
        ) : (
          <FormTextFieldInput
            defaultValue={recordFilter.value}
            onChange={onChange}
            VariablePicker={WorkflowVariablePicker}
            readonly={readonly}
          />
        )
      ) : (
        <FormTextFieldInput
          defaultValue={recordFilter.value}
          onChange={onChange}
          VariablePicker={WorkflowVariablePicker}
          readonly={readonly}
        />
      )}
    </>
  );
};
