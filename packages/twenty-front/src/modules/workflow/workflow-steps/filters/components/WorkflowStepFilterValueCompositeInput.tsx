import { FormCountryMultiSelectInput } from '@/object-record/record-field/ui/form-types/components/FormCountryMultiSelectInput';
import { FormMultiSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormMultiSelectFieldInput';
import { FormNumberFieldInput } from '@/object-record/record-field/ui/form-types/components/FormNumberFieldInput';
import { FormSingleRecordPicker } from '@/object-record/record-field/ui/form-types/components/FormSingleRecordPicker';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { CURRENCIES } from '@/settings/data-model/constants/Currencies';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { useContext } from 'react';
import { FieldActorSource, type StepFilter } from 'twenty-shared/types';
import { type SelectOption } from 'twenty-ui/input';
import { type JsonValue } from 'type-fest';

const ACTOR_SOURCE_OPTIONS: SelectOption[] = Object.values(
  FieldActorSource,
).map((source) => ({
  label: source.charAt(0) + source.slice(1).toLowerCase(),
  value: source,
}));

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
      ) : filterType === 'ACTOR' ? (
        subFieldName === 'source' ? (
          <FormMultiSelectFieldInput
            defaultValue={stepFilter.value}
            onChange={onChange}
            options={ACTOR_SOURCE_OPTIONS}
            readonly={readonly}
            VariablePicker={WorkflowVariablePicker}
          />
        ) : subFieldName === 'workspaceMemberId' ? (
          <FormSingleRecordPicker
            objectNameSingulars={['workspaceMember']}
            defaultValue={stepFilter.value}
            onChange={onChange}
            disabled={readonly}
            VariablePicker={WorkflowVariablePicker}
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
