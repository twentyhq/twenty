import { FormCountryMultiSelectInput } from '@/object-record/record-field/form-types/components/FormCountryMultiSelectInput';
import { FormMultiSelectFieldInput } from '@/object-record/record-field/form-types/components/FormMultiSelectFieldInput';
import { FormNumberFieldInput } from '@/object-record/record-field/form-types/components/FormNumberFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { CURRENCIES } from '@/settings/data-model/constants/Currencies';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/context/WorkflowStepFilterContext';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { useContext } from 'react';
import { StepFilter } from 'twenty-shared/types';
import { JsonValue } from 'type-fest';

export const WorkflowStepFilterValueCompositeInput = ({
  stepFilter,
  onChange,
}: {
  stepFilter: StepFilter;
  onChange: (newValue: JsonValue) => void;
}) => {
  const { readonly } = useContext(WorkflowStepFilterContext);
  const { type: filterType, compositeFieldSubFieldName: subFieldName } =
    stepFilter;

  return (
    <>
      {filterType === 'ADDRESS' ? (
        subFieldName === 'addressCountry' ? (
          <FormCountryMultiSelectInput
            defaultValue={stepFilter.value}
            onChange={onChange}
            VariablePicker={WorkflowVariablePicker}
            readonly={readonly}
          />
        ) : (
          <FormTextFieldInput
            defaultValue={stepFilter.value}
            onChange={onChange}
            VariablePicker={WorkflowVariablePicker}
            readonly={readonly}
          />
        )
      ) : filterType === 'CURRENCY' ? (
        subFieldName === 'currencyCode' ? (
          <FormMultiSelectFieldInput
            defaultValue={stepFilter.value}
            onChange={onChange}
            VariablePicker={WorkflowVariablePicker}
            options={CURRENCIES}
            readonly={readonly}
          />
        ) : subFieldName === 'amountMicros' ? (
          <FormNumberFieldInput
            defaultValue={stepFilter.value}
            onChange={onChange}
            VariablePicker={WorkflowVariablePicker}
            readonly={readonly}
          />
        ) : null
      ) : filterType === 'PHONES' ? (
        subFieldName === 'primaryPhoneNumber' ? (
          <FormNumberFieldInput
            defaultValue={stepFilter.value}
            onChange={onChange}
            VariablePicker={WorkflowVariablePicker}
            readonly={readonly}
          />
        ) : (
          <FormTextFieldInput
            defaultValue={stepFilter.value}
            onChange={onChange}
            VariablePicker={WorkflowVariablePicker}
            readonly={readonly}
          />
        )
      ) : (
        <FormTextFieldInput
          defaultValue={stepFilter.value}
          onChange={onChange}
          VariablePicker={WorkflowVariablePicker}
          readonly={readonly}
        />
      )}
    </>
  );
};
