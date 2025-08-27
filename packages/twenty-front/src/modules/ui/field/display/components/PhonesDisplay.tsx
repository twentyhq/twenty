import React, { useMemo } from 'react';

import { type FieldPhonesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';

import { parsePhoneNumber } from 'libphonenumber-js';
import { isDefined } from 'twenty-shared/utils';
import { CellItemListContainer } from 'twenty-ui/input';
import { RoundedLink } from 'twenty-ui/navigation';
import { logError } from '~/utils/logError';

type PhonesDisplayProps = {
  value?: FieldPhonesValue;
  isFocused?: boolean;
  onPhoneNumberClick?: (
    phoneNumber: string,
    event: React.MouseEvent<HTMLElement>,
  ) => void;
};

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
                '',
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
    } catch {
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
    <CellItemListContainer>
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
    </CellItemListContainer>
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
