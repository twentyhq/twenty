import { type MultiItemFieldInputSpacing } from '@/object-record/record-field/ui/meta-types/input/types/MultiItemFieldInputSpacing';
import { getMultiItemInputKeyDownHandler } from '@/object-record/record-field/ui/meta-types/input/utils/getMultiItemInputKeyDownHandler';
import { PhoneCountryPickerDropdownButton } from '@/ui/input/components/internal/phone/components/PhoneCountryPickerDropdownButton';
import { styled } from '@linaria/react';
import { type CountryCode, type E164Number } from 'libphonenumber-js';
import { type Ref } from 'react';
import ReactPhoneNumberInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledPhoneInputContainer = styled.div<{
  hasBorder: boolean;
  hasError: boolean;
  spacing: MultiItemFieldInputSpacing;
}>`
  align-self: ${({ spacing }) => (spacing === 'compact' ? 'stretch' : 'auto')};
  background-color: ${({ hasBorder }) =>
    hasBorder
      ? themeCssVariables.background.transparent.lighter
      : 'transparent'};
  border: ${({ hasBorder, hasError }) =>
    hasBorder
      ? `1px solid ${
          hasError
            ? themeCssVariables.border.color.danger
            : themeCssVariables.border.color.medium
        }`
      : 'none'};
  border-radius: ${({ hasBorder }) =>
    hasBorder ? themeCssVariables.border.radius.sm : '0'};
  flex: 1;
  height: ${({ hasBorder }) => (hasBorder ? '30px' : 'auto')};
  min-width: 0;
`;

const StyledPhoneInputWrapper = styled.div<{
  spacing: MultiItemFieldInputSpacing;
}>`
  background-color: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.font.family};
  font-size: inherit;
  font-weight: inherit;
  height: 100%;
  width: 100%;

  .PhoneInput {
    height: 100%;
  }

  .PhoneInputInput {
    background: none;
    border: none;
    box-sizing: border-box;
    color: ${themeCssVariables.font.color.primary};
    height: 100%;
    padding-left: ${({ spacing }) =>
      spacing === 'compact'
        ? themeCssVariables.spacing[1]
        : themeCssVariables.spacing[2]};

    &::placeholder,
    &::-webkit-input-placeholder {
      color: ${themeCssVariables.font.color.light};
      font-family: ${themeCssVariables.font.family};
      font-weight: ${themeCssVariables.font.weight.medium};
    }

    &:focus {
      outline: none;
    }
  }
`;

type PhonesFieldPhoneInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  defaultCountry?: CountryCode;
  autoFocus?: boolean;
  hasBorder?: boolean;
  hasError?: boolean;
  spacing?: MultiItemFieldInputSpacing;
  onEnter?: () => void;
  onEscape?: () => void;
  onBlur?: () => void;
  shouldPreventTabNavigation?: boolean;
  ref?: Ref<HTMLInputElement>;
};

export const PhonesFieldPhoneInput = ({
  value,
  onChange,
  placeholder,
  defaultCountry,
  autoFocus,
  hasBorder = false,
  hasError = false,
  spacing = 'default',
  onEnter,
  onEscape,
  onBlur,
  shouldPreventTabNavigation,
  ref,
}: PhonesFieldPhoneInputProps) => (
  <StyledPhoneInputContainer
    hasBorder={hasBorder}
    hasError={hasError}
    spacing={spacing}
  >
    <StyledPhoneInputWrapper spacing={spacing}>
      <ReactPhoneNumberInput
        // Typed as the class component, but the library forwards it to the <input>
        ref={ref as unknown as Ref<InstanceType<typeof ReactPhoneNumberInput>>}
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={value as E164Number}
        onChange={(newValue?: E164Number) => onChange(newValue ?? '')}
        onBlur={onBlur}
        onKeyDown={getMultiItemInputKeyDownHandler({
          onEnter,
          onEscape,
          shouldPreventTabNavigation,
        })}
        international={true}
        withCountryCallingCode={true}
        countrySelectComponent={PhoneCountryPickerDropdownButton}
        defaultCountry={defaultCountry}
      />
    </StyledPhoneInputWrapper>
  </StyledPhoneInputContainer>
);
