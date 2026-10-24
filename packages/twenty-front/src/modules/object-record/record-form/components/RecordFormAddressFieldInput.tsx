import { type FormFieldInputSubFieldPlaceholders } from '@/object-record/record-field/ui/form-types/types/FormFieldInputSubFieldPlaceholders';
import { type FieldAddressValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { normalizeAddressFieldValueForPersist } from '@/object-record/record-field/ui/utils/normalizeAddressFieldValueForPersist';
import { FieldInputDetailsToggleRow } from '@/ui/field/input/components/FieldInputDetailsToggleRow';
import { StyledRecordFormFieldBox } from '@/object-record/record-form/components/StyledRecordFormFieldBox';
import { StyledFieldInputDetails } from '@/ui/field/input/components/StyledFieldInputDetails';
import { StyledTextInput } from '@/ui/field/input/components/TextInput';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { CountrySelect } from '@/ui/input/components/internal/country/components/CountrySelect';
import { TextInput } from '@/ui/input/components/TextInput';
import { ADDRESS_DETAIL_SUB_FIELDS } from '@/ui/field/input/constants/AddressDetailSubFields';
import { hasAddressDetailValue } from '@/ui/field/input/utils/hasAddressDetailValue';
import { StyledFieldInputFullWidthDetail } from '@/ui/field/input/components/StyledFieldInputFullWidthDetail';
import { AddressAutocompleteRoot } from '@/ui/field/input/components/AddressAutocompleteRoot';
import { useAddressAutocomplete } from '@/ui/field/input/hooks/useAddressAutocomplete';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { atom, useAtomValue, useStore } from 'jotai';
import { useId, useState } from 'react';
import { type AllowedAddressSubField } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Autocomplete, Field } from 'twenty-ui/primitives/input';

type AddressTextSubField = Exclude<
  AllowedAddressSubField,
  'addressLat' | 'addressLng'
>;

type AddressSuggestedSubField = 'addressStreet1' | 'addressCity';

const EMPTY_ADDRESS: FieldAddressValue = {
  addressStreet1: '',
  addressStreet2: '',
  addressCity: '',
  addressState: '',
  addressPostcode: '',
  addressCountry: '',
  addressLat: null,
  addressLng: null,
};

type RecordFormAddressFieldInputProps = {
  label?: string;
  defaultValue?: FieldAddressValue;
  subFields?: AllowedAddressSubField[] | null;
  subFieldPlaceholders?: FormFieldInputSubFieldPlaceholders;
  onChange: (value: FieldAddressValue) => void;
};

export const RecordFormAddressFieldInput = ({
  label,
  defaultValue,
  subFields,
  subFieldPlaceholders,
  onChange,
}: RecordFormAddressFieldInputProps) => {
  const { t } = useLingui();
  const instanceId = useId();
  const addressSuggestionsDropdownId = `${instanceId}-address-suggestions`;

  const store = useStore();
  const [addressAtom] = useState(() =>
    atom<FieldAddressValue>({ ...EMPTY_ADDRESS, ...defaultValue }),
  );
  const address = useAtomValue(addressAtom);

  const {
    placeAutocompleteData,
    typeOfAddressForAutocomplete,
    searchPlaces,
    selectPlace,
    closeDropdownOfAutocomplete,
  } = useAddressAutocomplete({
    onChange: (updatedAddress) =>
      onChange(normalizeAddressFieldValueForPersist(updatedAddress)),
    dropdownId: addressSuggestionsDropdownId,
  });

  const hasSubField = (subField: AllowedAddressSubField) =>
    !isDefined(subFields) || subFields.includes(subField);

  const hasStreet1 = hasSubField('addressStreet1');
  const hasDetails = ADDRESS_DETAIL_SUB_FIELDS.some(hasSubField);

  const [isExpanded, setIsExpanded] = useState(() =>
    hasAddressDetailValue({ address, subFields }),
  );

  const shouldShowDetails = hasDetails && (!hasStreet1 || isExpanded);

  const handleSubFieldChange =
    (subField: AddressTextSubField) => (subFieldValue: string) => {
      const updatedAddress = { ...address, [subField]: subFieldValue };

      store.set(addressAtom, updatedAddress);
      onChange(normalizeAddressFieldValueForPersist(updatedAddress));
    };

  const handleSuggestedSubFieldChange =
    (subField: AddressSuggestedSubField) => (subFieldValue: string) => {
      handleSubFieldChange(subField)(subFieldValue);
      searchPlaces({
        subField,
        text: subFieldValue,
        countryName: address.addressCountry ?? '',
      });
    };

  const handlePlaceSelection = async (placeId: string) => {
    const updatedAddress = await selectPlace({
      placeId,
      getInternalValue: () => store.get(addressAtom),
    });

    if (!isDefined(updatedAddress)) {
      return;
    }

    store.set(addressAtom, { ...EMPTY_ADDRESS, ...updatedAddress });

    if (hasAddressDetailValue({ address: updatedAddress, subFields })) {
      setIsExpanded(true);
    }
  };

  return (
    <FormFieldInputContainer>
      {isNonEmptyString(label) ? (
        <Field.Label htmlFor={hasStreet1 ? instanceId : undefined}>
          {label}
        </Field.Label>
      ) : null}
      <StyledRecordFormFieldBox>
        {hasStreet1 && (
          <FieldInputDetailsToggleRow
            isExpanded={isExpanded}
            toggleLabel={t`Address details`}
            hasToggle={hasDetails}
            onToggle={() => setIsExpanded(!isExpanded)}
          >
            <AddressAutocompleteRoot
              dropdownId={addressSuggestionsDropdownId}
              isEnabled={typeOfAddressForAutocomplete === 'addressStreet1'}
              places={placeAutocompleteData}
              value={address.addressStreet1 ?? ''}
              onValueChange={handleSuggestedSubFieldChange('addressStreet1')}
              onClose={closeDropdownOfAutocomplete}
              onPlaceSelect={handlePlaceSelection}
            >
              <Autocomplete.Input
                id={instanceId}
                placeholder={
                  subFieldPlaceholders?.addressStreet1 ?? t`Street address`
                }
                render={(inputProps) => (
                  // oxlint-disable-next-line react/jsx-props-no-spreading
                  <StyledTextInput {...inputProps} />
                )}
              />
            </AddressAutocompleteRoot>
          </FieldInputDetailsToggleRow>
        )}
        {shouldShowDetails && (
          <StyledFieldInputDetails hasSeparator={hasStreet1}>
            {hasSubField('addressStreet2') && (
              <StyledFieldInputFullWidthDetail>
                <TextInput
                  label={t`Address 2`}
                  placeholder={
                    subFieldPlaceholders?.addressStreet2 ?? t`Street address 2`
                  }
                  value={address.addressStreet2 ?? ''}
                  fullWidth
                  onChange={handleSubFieldChange('addressStreet2')}
                />
              </StyledFieldInputFullWidthDetail>
            )}
            {hasSubField('addressCity') && (
              // Own field so the outer field label does not name the city input
              <Field.Root>
                <AddressAutocompleteRoot
                  dropdownId={addressSuggestionsDropdownId}
                  isEnabled={typeOfAddressForAutocomplete === 'addressCity'}
                  places={placeAutocompleteData}
                  value={address.addressCity ?? ''}
                  onValueChange={handleSuggestedSubFieldChange('addressCity')}
                  onClose={closeDropdownOfAutocomplete}
                  onPlaceSelect={handlePlaceSelection}
                >
                  <Autocomplete.Input
                    aria-label={t`City`}
                    render={(inputProps) => (
                      <TextInput
                        inputProps={inputProps}
                        label={t`City`}
                        placeholder={
                          subFieldPlaceholders?.addressCity ?? t`City`
                        }
                        fullWidth
                      />
                    )}
                  />
                </AddressAutocompleteRoot>
              </Field.Root>
            )}
            {hasSubField('addressState') && (
              <TextInput
                label={t`State`}
                placeholder={subFieldPlaceholders?.addressState ?? t`State`}
                value={address.addressState ?? ''}
                fullWidth
                onChange={handleSubFieldChange('addressState')}
              />
            )}
            {hasSubField('addressPostcode') && (
              <TextInput
                label={t`Post Code`}
                placeholder={
                  subFieldPlaceholders?.addressPostcode ?? t`Post Code`
                }
                value={address.addressPostcode ?? ''}
                fullWidth
                onChange={handleSubFieldChange('addressPostcode')}
              />
            )}
            {hasSubField('addressCountry') && (
              <CountrySelect
                label={t`Country`}
                selectedCountryName={address.addressCountry ?? ''}
                onChange={handleSubFieldChange('addressCountry')}
                dropdownId={`${instanceId}-country`}
              />
            )}
          </StyledFieldInputDetails>
        )}
      </StyledRecordFormFieldBox>
    </FormFieldInputContainer>
  );
};
