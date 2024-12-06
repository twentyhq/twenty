import styled from '@emotion/styled';
import { useMemo } from 'react';
import { RoundedLink, THEME_COMMON } from 'twenty-ui';

import { FieldPhonesValue } from '@/object-record/record-field/types/FieldMetadata';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';

import { parsePhoneNumber } from 'libphonenumber-js';
import { isDefined } from '~/utils/isDefined';
import { logError } from '~/utils/logError';

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
              callingCode: value.primaryPhoneCountryCode,
            }
          : null,
        ...parseAdditionalPhones(value?.additionalPhones),
      ]
        .filter(isDefined)
        .map(({ number, callingCode }) => {
          return {
            number,
            callingCode,
          };
        }),
    [
      value?.primaryPhoneNumber,
      value?.primaryPhoneCountryCode,
      value?.additionalPhones,
    ],
  );

  const parsePhoneNumberOrReturnInvalidValue = (number: string) => {
    try {
      return { parsedPhone: parsePhoneNumber(number) };
    } catch (e) {
      return { invalidPhone: number };
    }
  };

  return isFocused ? (
    <ExpandableList isChipCountDisplayed>
      {phones.map(({ number, callingCode }, index) => {
        const { parsedPhone, invalidPhone } =
          parsePhoneNumberOrReturnInvalidValue(callingCode + number);
        const URI = parsedPhone?.getURI();
        return (
          <RoundedLink
            key={index}
            href={URI || ''}
            label={
              parsedPhone ? parsedPhone.formatInternational() : invalidPhone
            }
          />
        );
      })}
    </ExpandableList>
  ) : (
    <StyledContainer>
      {phones.map(({ number, callingCode }, index) => {
        const { parsedPhone, invalidPhone } =
          parsePhoneNumberOrReturnInvalidValue(callingCode + number);
        const URI = parsedPhone?.getURI();
        return (
          <RoundedLink
            key={index}
            href={URI || ''}
            label={
              parsedPhone ? parsedPhone.formatInternational() : invalidPhone
            }
          />
        );
      })}
    </StyledContainer>
  );
};

const parseAdditionalPhones = (additionalPhones?: any) => {
  if (!additionalPhones) {
    return [];
  }

  if (typeof additionalPhones === 'object') {
    return additionalPhones;
  }

  if (typeof additionalPhones === 'string') {
    try {
      return JSON.parse(additionalPhones);
    } catch (error) {
      logError(`Error parsing additional phones' : ` + error);
    }
  }

  return [];
};
