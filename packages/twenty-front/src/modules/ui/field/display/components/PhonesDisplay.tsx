import styled from '@emotion/styled';
import React, { useMemo } from 'react';
import { RoundedLink, THEME_COMMON } from 'twenty-ui';

import { FieldPhonesValue } from '@/object-record/record-field/types/FieldMetadata';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';

import { DEFAULT_PHONE_CALLING_CODE } from '@/object-record/record-field/meta-types/input/components/PhonesFieldInput';
import { parsePhoneNumber } from 'libphonenumber-js';
import { isDefined } from '~/utils/isDefined';
import { logError } from '~/utils/logError';

type PhonesDisplayProps = {
  value?: FieldPhonesValue;
  isFocused?: boolean;
  onPhoneNumberClick?: (
    phoneNumber: string,
    event: React.MouseEvent<HTMLElement>,
  ) => void;
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

export const PhonesDisplay = ({
  value,
  isFocused,
  onPhoneNumberClick,
}: PhonesDisplayProps) => {
  const phones = useMemo(
    () =>
      [
        value?.primaryPhoneNumber
          ? {
              number: value.primaryPhoneNumber,
              callingCode:
                value.primaryPhoneCallingCode ||
                value.primaryPhoneCountryCode ||
                `+${DEFAULT_PHONE_CALLING_CODE}`,
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
      value?.primaryPhoneCallingCode,
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

  const handleClick = (
    number: string,
    event: React.MouseEvent<HTMLElement>,
  ) => {
    onPhoneNumberClick?.(number, event);
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
            onClick={(event) => handleClick(callingCode + number, event)}
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
            onClick={(event) => handleClick(callingCode + number, event)}
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
