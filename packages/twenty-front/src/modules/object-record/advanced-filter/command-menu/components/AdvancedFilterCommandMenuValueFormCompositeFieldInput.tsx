import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { subFieldNameUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/subFieldNameUsedInDropdownComponentState';
import { FormCountryMultiSelectInput } from '@/object-record/record-field/ui/form-types/components/FormCountryMultiSelectInput';
import { FormMultiSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormMultiSelectFieldInput';
import { FormNumberFieldInput } from '@/object-record/record-field/ui/form-types/components/FormNumberFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { CURRENCIES } from '@/settings/data-model/constants/Currencies';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useContext } from 'react';
import { FieldActorSource } from 'twenty-shared/types';
import { type SelectOption } from 'twenty-ui/input';
import { type JsonValue } from 'type-fest';

const ACTOR_SOURCE_OPTIONS: SelectOption[] = Object.values(
  FieldActorSource,
).map((source) => ({
  label: source.charAt(0) + source.slice(1).toLowerCase(),
  value: source,
}));

export const AdvancedFilterCommandMenuValueFormCompositeFieldInput = ({
  recordFilter,
  onChange,
}: {
  recordFilter: RecordFilter;
  onChange: (newValue: JsonValue) => void;
}) => {
  const { VariablePicker } = useContext(AdvancedFilterContext);

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
            VariablePicker={VariablePicker}
            readonly={readonly}
          />
        ) : (
          <FormTextFieldInput
            defaultValue={recordFilter.value}
            onChange={onChange}
            VariablePicker={VariablePicker}
            readonly={readonly}
          />
        )
      ) : filterType === 'CURRENCY' ? (
        recordFilter.subFieldName === 'currencyCode' ? (
          <FormMultiSelectFieldInput
            defaultValue={recordFilter.value}
            onChange={onChange}
            VariablePicker={VariablePicker}
            options={CURRENCIES}
            readonly={readonly}
          />
        ) : recordFilter.subFieldName === 'amountMicros' ? (
          <FormNumberFieldInput
            defaultValue={recordFilter.value}
            onChange={onChange}
            VariablePicker={VariablePicker}
            readonly={readonly}
          />
        ) : null
      ) : filterType === 'PHONES' ? (
        recordFilter.subFieldName === 'primaryPhoneNumber' ? (
          <FormNumberFieldInput
            defaultValue={recordFilter.value}
            onChange={onChange}
            VariablePicker={VariablePicker}
            readonly={readonly}
          />
        ) : (
          <FormTextFieldInput
            defaultValue={recordFilter.value}
            onChange={onChange}
            VariablePicker={VariablePicker}
            readonly={readonly}
          />
        )
      ) : filterType === 'ACTOR' ? (
        recordFilter.subFieldName === 'source' ? (
          <FormMultiSelectFieldInput
            defaultValue={recordFilter.value}
            onChange={onChange}
            options={ACTOR_SOURCE_OPTIONS}
            readonly={readonly}
            VariablePicker={VariablePicker}
          />
        ) : (
          <FormTextFieldInput
            defaultValue={recordFilter.value}
            onChange={onChange}
            VariablePicker={VariablePicker}
            readonly={readonly}
          />
        )
      ) : (
        <FormTextFieldInput
          defaultValue={recordFilter.value}
          onChange={onChange}
          VariablePicker={VariablePicker}
          readonly={readonly}
        />
      )}
    </>
  );
};
