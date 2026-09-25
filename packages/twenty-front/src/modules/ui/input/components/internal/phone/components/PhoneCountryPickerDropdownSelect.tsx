import { type Country } from '@/ui/input/components/internal/types/Country';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';
import 'react-phone-number-input/style.css';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledIconContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  padding-right: ${themeCssVariables.spacing[1]};

  svg {
    align-items: center;
    border-radius: ${themeCssVariables.border.radius.xs};
    display: flex;
    height: 12px;
    justify-content: center;
  }
`;

export const PhoneCountryPickerDropdownSelect = ({
  countries,
  selectedCountry,
  onChange,
}: {
  countries: Country[];
  selectedCountry?: Country;
  onChange: (countryCode: string) => void;
}) => {
  const [searchFilter, setSearchFilter] = useState<string>('');

  const filteredCountries = useMemo(
    () =>
      countries.filter(({ countryName }) =>
        countryName
          .toLocaleLowerCase()
          .includes(searchFilter.toLocaleLowerCase()),
      ),
    [countries, searchFilter],
  );

  return (
    <>
      <Dropdown.Search
        value={searchFilter}
        placeholder={t`Search`}
        aria-label={t`Search`}
        onValueChange={setSearchFilter}
      />
      <Dropdown.Separator />
      <Dropdown.Section scrollable>
        {!isNonEmptyArray(filteredCountries) ? (
          <Dropdown.Empty>{t`No results`}</Dropdown.Empty>
        ) : (
          <>
            {isDefined(selectedCountry) && (
              <Dropdown.OptionItem
                key={selectedCountry.countryCode}
                onSelect={() => onChange(selectedCountry.countryCode)}
                selected={true}
                startIcon={
                  <StyledIconContainer>
                    <selectedCountry.Flag />
                  </StyledIconContainer>
                }
              >
                <OverflowingTextWithTooltip
                  text={`${selectedCountry.countryName} (+${selectedCountry.callingCode})`}
                />
              </Dropdown.OptionItem>
            )}
            {filteredCountries.map(
              ({ countryCode, countryName, callingCode, Flag }) =>
                selectedCountry?.countryCode === countryCode ? null : (
                  <Dropdown.OptionItem
                    key={countryCode}
                    onSelect={() => onChange(countryCode)}
                    selected={selectedCountry?.countryCode === countryCode}
                    startIcon={
                      <StyledIconContainer>
                        <Flag />
                      </StyledIconContainer>
                    }
                  >
                    <OverflowingTextWithTooltip
                      text={`${countryName} (+${callingCode})`}
                    />
                  </Dropdown.OptionItem>
                ),
            )}
          </>
        )}
      </Dropdown.Section>
    </>
  );
};
