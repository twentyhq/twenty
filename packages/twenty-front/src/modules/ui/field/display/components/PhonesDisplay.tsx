import { t } from '@lingui/core/macro';
import React, { useMemo } from 'react';

import { type FieldPhonesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';

import { styled } from '@linaria/react';
import { parsePhoneNumber } from 'libphonenumber-js';
import { isDefined } from 'twenty-shared/utils';
import { RoundedLink } from 'twenty-ui/navigation';
import { z } from 'zod';
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
            onClick={(event) =>
              onPhoneNumberClick?.(callingCode + number, event)
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
            onClick={(event) =>
              onPhoneNumberClick?.(callingCode + number, event)
            }
          />
        );
      })}
    </StyledContainer>
  );
};

const additionalPhoneSchema = z.object({
  number: z.string().min(1),
  callingCode: z.string().optional(),
  countryCode: z.string().optional(),
});

const parseAdditionalPhonesArray = (additionalPhones: unknown[]) =>
  additionalPhones
    .map((phone) => additionalPhoneSchema.safeParse(phone))
    .filter((result) => result.success)
    .map((result) => result.data);

const parseAdditionalPhones = (additionalPhones?: unknown) => {
  if (!additionalPhones) {
    return [];
  }

  if (Array.isArray(additionalPhones)) {
    return parseAdditionalPhonesArray(additionalPhones);
  }

  if (typeof additionalPhones === 'string') {
    try {
      const parsed = JSON.parse(additionalPhones);
      return Array.isArray(parsed) ? parseAdditionalPhonesArray(parsed) : [];
    } catch (error) {
      logError(t`Error parsing additional phones: ${String(error)}`);
    }
  }

  return [];
};
