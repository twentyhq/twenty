import { t } from '@lingui/core/macro';
import { type ComponentProps, useId } from 'react';
import { PhoneCountryPicker } from 'twenty-ui/components';

import { useCountries } from '@/ui/input/components/internal/hooks/useCountries';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';

type PhoneCountryPickerDropdownButtonProps = Pick<
  ComponentProps<typeof PhoneCountryPicker.Trigger>,
  | 'ref'
  | 'id'
  | 'name'
  | 'className'
  | 'style'
  | 'title'
  | 'tabIndex'
  | 'onFocus'
  | 'onBlur'
  | 'onClick'
  | 'onKeyDown'
  | 'onPointerDown'
  | 'aria-invalid'
  | 'aria-required'
  | 'aria-labelledby'
  | 'aria-describedby'
  | 'disabled'
> & {
  value?: string;
  onChange: (countryCode: string) => void;
  'aria-label'?: string;
  readOnly?: boolean;
};

export const PhoneCountryPickerDropdownButton = ({
  value,
  onChange,
  disabled,
  readOnly,
  ref,
  id,
  name,
  className,
  style,
  title,
  tabIndex,
  onFocus,
  onBlur,
  onClick,
  onKeyDown,
  onPointerDown,
  'aria-label': ariaLabel = t`Country`,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  'aria-required': ariaRequired,
}: PhoneCountryPickerDropdownButtonProps) => {
  const dropdownId = useId();
  const countries = useCountries().map(
    ({ countryCode, countryName, callingCode, Flag }) => ({
      value: countryCode,
      label: countryName,
      callingCode,
      flag: <Flag />,
    }),
  );
  const selectedCountry = countries.find((country) => country.value === value);

  return (
    <DropdownRoot dropdownId={dropdownId} type="picker">
      <PhoneCountryPicker.Trigger
        ref={ref}
        id={id}
        name={name}
        className={className}
        style={style}
        title={title}
        tabIndex={tabIndex}
        onFocus={onFocus}
        onBlur={onBlur}
        onClick={onClick}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        country={selectedCountry}
        disabled={disabled || readOnly}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        aria-required={ariaRequired}
      />
      <DropdownContent
        side="bottom"
        align="start"
        sideOffset={4}
        alignOffset={0}
        aria-label={ariaLabel}
      >
        <PhoneCountryPicker.Options
          countries={countries}
          value={value}
          onValueChange={onChange}
          searchLabel={t`Search`}
          emptyLabel={t`No results`}
        />
      </DropdownContent>
    </DropdownRoot>
  );
};
