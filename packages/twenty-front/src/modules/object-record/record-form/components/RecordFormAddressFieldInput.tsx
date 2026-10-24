import { type FieldAddressValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { normalizeAddressFieldValueForPersist } from '@/object-record/record-field/ui/utils/normalizeAddressFieldValueForPersist';
import { RecordFormFieldDetailsToggleRow } from '@/object-record/record-form/components/RecordFormFieldDetailsToggleRow';
import { StyledRecordFormFieldBox } from '@/object-record/record-form/components/StyledRecordFormFieldBox';
import { StyledRecordFormFieldDetails } from '@/object-record/record-form/components/StyledRecordFormFieldDetails';
import { StyledTextInput } from '@/ui/field/input/components/TextInput';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { CountrySelect } from '@/ui/input/components/internal/country/components/CountrySelect';
import { TextInput } from '@/ui/input/components/TextInput';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useId, useState } from 'react';
import { type AllowedAddressSubField } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Field } from 'twenty-ui/primitives/input';

type AddressTextSubField = Exclude<
  AllowedAddressSubField,
  'addressLat' | 'addressLng'
>;

const ADDRESS_DETAIL_SUB_FIELDS: AddressTextSubField[] = [
  'addressStreet2',
  'addressCity',
  'addressState',
  'addressPostcode',
  'addressCountry',
];

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

const StyledFullWidthDetail = styled.div`
  grid-column: 1 / -1;
`;

type RecordFormAddressFieldInputProps = {
  label?: string;
  defaultValue?: FieldAddressValue;
  subFields?: AllowedAddressSubField[] | null;
  placeholder?: string;
  onChange: (value: FieldAddressValue) => void;
};

export const RecordFormAddressFieldInput = ({
  label,
  defaultValue,
  subFields,
  placeholder,
  onChange,
}: RecordFormAddressFieldInputProps) => {
  const { t } = useLingui();
  const instanceId = useId();

  const [address, setAddress] = useState<FieldAddressValue>({
    ...EMPTY_ADDRESS,
    ...defaultValue,
  });

  const hasSubField = (subField: AllowedAddressSubField) =>
    !isDefined(subFields) || subFields.includes(subField);

  const hasStreet1 = hasSubField('addressStreet1');
  const hasDetails = ADDRESS_DETAIL_SUB_FIELDS.some(hasSubField);

  const [isExpanded, setIsExpanded] = useState(() =>
    ADDRESS_DETAIL_SUB_FIELDS.some((subField) =>
      isNonEmptyString(address[subField]),
    ),
  );

  const shouldShowDetails = hasDetails && (!hasStreet1 || isExpanded);

  const handleSubFieldChange =
    (subField: AddressTextSubField) => (subFieldValue: string) => {
      const updatedAddress = { ...address, [subField]: subFieldValue };

      setAddress(updatedAddress);
      onChange(normalizeAddressFieldValueForPersist(updatedAddress));
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
          <RecordFormFieldDetailsToggleRow
            isExpanded={isExpanded}
            toggleLabel={t`Address details`}
            hasToggle={hasDetails}
            onToggle={() => setIsExpanded(!isExpanded)}
          >
            <StyledTextInput
              id={instanceId}
              autoComplete="off"
              placeholder={placeholder ?? t`Street address`}
              value={address.addressStreet1 ?? ''}
              onChange={(event) =>
                handleSubFieldChange('addressStreet1')(event.target.value)
              }
            />
          </RecordFormFieldDetailsToggleRow>
        )}
        {shouldShowDetails && (
          <StyledRecordFormFieldDetails hasSeparator={hasStreet1}>
            {hasSubField('addressStreet2') && (
              <StyledFullWidthDetail>
                <TextInput
                  label={t`Address 2`}
                  value={address.addressStreet2 ?? ''}
                  fullWidth
                  onChange={handleSubFieldChange('addressStreet2')}
                />
              </StyledFullWidthDetail>
            )}
            {hasSubField('addressCity') && (
              <TextInput
                label={t`City`}
                value={address.addressCity ?? ''}
                fullWidth
                onChange={handleSubFieldChange('addressCity')}
              />
            )}
            {hasSubField('addressState') && (
              <TextInput
                label={t`State`}
                value={address.addressState ?? ''}
                fullWidth
                onChange={handleSubFieldChange('addressState')}
              />
            )}
            {hasSubField('addressPostcode') && (
              <TextInput
                label={t`Post Code`}
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
              />
            )}
          </StyledRecordFormFieldDetails>
        )}
      </StyledRecordFormFieldBox>
    </FormFieldInputContainer>
  );
};
