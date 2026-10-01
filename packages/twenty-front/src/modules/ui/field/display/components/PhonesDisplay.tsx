import { useLingui } from '@lingui/react/macro';
import { createPhonesFromFieldValue } from '@/object-record/record-field/ui/meta-types/input/utils/phonesUtils';
import { type FieldPhonesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { ExpandableList } from 'twenty-ui/components';
import { styled } from '@linaria/react';
import { parsePhoneNumber } from 'libphonenumber-js';
import React, { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { RoundedLink } from '@/ui/navigation/link/components/RoundedLink/RoundedLink';

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
  const { t } = useLingui();

  const phones = useMemo(() => {
    if (!isDefined(value)) {
      return [];
    }

    return createPhonesFromFieldValue(value);
  }, [value]);
  const parsePhoneNumberOrReturnInvalidValue = (number: string) => {
    try {
      return { parsedPhone: parsePhoneNumber(number) };
    } catch {
      return { invalidPhone: number };
    }
  };

  return isFocused ? (
    <ExpandableList overflowLabel={t`Show all items`} showOverflowCount>
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
