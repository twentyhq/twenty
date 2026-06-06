import { t } from '@lingui/core/macro';
import React, { useMemo } from 'react';

import { type FieldPhonesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';

import { styled } from '@linaria/react';
import { parsePhoneNumber } from 'libphonenumber-js';
import { isDefined } from 'twenty-shared/utils';
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

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
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
                '',
              phoneType: value.primaryPhoneType,
              extension: value.primaryPhoneExtension,
            }
          : null,
        ...parseAdditionalPhones(value?.additionalPhones),
      ]
        .filter(isDefined)
        .map(({ number, callingCode, phoneType, extension }) => {
          return {
            number,
            callingCode,
            phoneType,
            extension,
          };
        }),
    [
      value?.primaryPhoneNumber,
      value?.primaryPhoneCallingCode,
      value?.primaryPhoneCountryCode,
      value?.primaryPhoneType,
      value?.primaryPhoneExtension,
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

  return isFocused ? (
    <ExpandableList isChipCountDisplayed>
      {phones.map(({ number, callingCode, phoneType, extension }, index) => {
        const { parsedPhone, invalidPhone } =
          parsePhoneNumberOrReturnInvalidValue(callingCode + number);
        const URI = parsedPhone?.getURI();
        const label = parsedPhone
          ? parsedPhone.formatInternational()
          : invalidPhone;
        const displayLabel = [
          label,
          phoneType && `(${phoneType})`,
          extension && `ext. ${extension}`,
        ]
          .filter(isDefined)
          .join(' ');
        return (
          <RoundedLink
            key={index}
            href={URI || ''}
            label={displayLabel}
            onClick={(event) =>
              onPhoneNumberClick?.(callingCode + number, event)
            }
          />
        );
      })}
    </ExpandableList>
  ) : (
    <StyledContainer>
      {phones.map(({ number, callingCode, phoneType, extension }, index) => {
        const { parsedPhone, invalidPhone } =
          parsePhoneNumberOrReturnInvalidValue(callingCode + number);
        const URI = parsedPhone?.getURI();
        const label = parsedPhone
          ? parsedPhone.formatInternational()
          : invalidPhone;
        const displayLabel = [
          label,
          phoneType && `(${phoneType})`,
          extension && `ext. ${extension}`,
        ]
          .filter(isDefined)
          .join(' ');
        return (
          <RoundedLink
            key={index}
            href={URI || ''}
            label={displayLabel}
            onClick={(event) =>
              onPhoneNumberClick?.(callingCode + number, event)
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
      logError(t`Error parsing additional phones: ${error}`);
    }
  }

  return [];
};
