import styled from '@emotion/styled';
import { useMemo } from 'react';
import { THEME_COMMON } from 'twenty-ui';

import { FieldPhonesValue } from '@/object-record/record-field/types/FieldMetadata';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import { RoundedLink } from '@/ui/navigation/link/components/RoundedLink';

import { parsePhoneNumber } from 'libphonenumber-js';
import { isDefined } from '~/utils/isDefined';

type PhonesDisplayProps = {
  value?: FieldPhonesValue;
  isFocused?: boolean;
};

const themeSpacing = THEME_COMMON.spacingMultiplicator;

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeSpacing * 1}px;
  justify-content: flex-start;

  max-width: 100%;

  overflow: hidden;

  width: 100%;
`;

export const PhonesDisplay = ({ value, isFocused }: PhonesDisplayProps) => {
  const phones = useMemo(
    () =>
      [
        value?.primaryPhoneNumber
          ? {
              number: value.primaryPhoneNumber,
              countryCode: value.primaryPhoneCountryCode,
            }
          : null,
        ...(value?.additionalPhones ?? []),
      ]
        .filter(isDefined)
        .map(({ number, countryCode }) => {
          return {
            number,
            countryCode,
          };
        }),
    [
      value?.primaryPhoneNumber,
      value?.primaryPhoneCountryCode,
      value?.additionalPhones,
    ],
  );

  return isFocused ? (
    <ExpandableList isChipCountDisplayed>
      {phones.map(({ number, countryCode }, index) => {
        const parsedPhone = parsePhoneNumber(countryCode + number);
        const URI = parsedPhone.getURI();
        return (
          <RoundedLink
            key={index}
            href={URI}
            label={parsedPhone.formatInternational()}
          />
        );
      })}
    </ExpandableList>
  ) : (
    <StyledContainer>
      {phones.map(({ number, countryCode }, index) => {
        const parsedPhone = parsePhoneNumber(countryCode + number);
        const URI = parsedPhone.getURI();
        return (
          <RoundedLink
            key={index}
            href={URI}
            label={parsedPhone.formatInternational()}
          />
        );
      })}
    </StyledContainer>
  );
};
