import { type Country } from '@/ui/input/components/internal/types/Country';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';
import 'react-phone-number-input/style.css';
import { OverflowingTextWithTooltip } from 'twenty-ui/components';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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
    <DropdownContent>
      <DropdownMenuSearchInput
        value={searchFilter}
        onChange={(event) => setSearchFilter(event.currentTarget.value)}
        autoFocus
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        {filteredCountries?.length === 0 ? (
          <ListItem disabled>{t`No results`}</ListItem>
        ) : (
          <>
            {selectedCountry && (
              <ListItem
                key={selectedCountry.countryCode}
                onClick={() => onChange(selectedCountry.countryCode)}
                role="option"
                aria-selected={true}
                selected={true}
                indicator="check"
                startIcon={
                  <StyledIconContainer>
                    <selectedCountry.Flag />
                  </StyledIconContainer>
                }
              >
                <OverflowingTextWithTooltip
                  text={`${selectedCountry.countryName} (+${selectedCountry.callingCode})`}
                />
              </ListItem>
            )}
            {filteredCountries.map(
              ({ countryCode, countryName, callingCode, Flag }) =>
                selectedCountry?.countryCode === countryCode ? null : (
                  <ListItem
                    key={countryCode}
                    onClick={() => onChange(countryCode)}
                    role="option"
                    aria-selected={selectedCountry?.countryCode === countryCode}
                    selected={selectedCountry?.countryCode === countryCode}
                    indicator="check"
                    startIcon={
                      <StyledIconContainer>
                        <Flag />
                      </StyledIconContainer>
                    }
                  >
                    <OverflowingTextWithTooltip
                      text={`${countryName} (+${callingCode})`}
                    />
                  </ListItem>
                ),
            )}
          </>
        )}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
