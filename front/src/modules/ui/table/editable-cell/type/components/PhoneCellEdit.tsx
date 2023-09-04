import { useRef, useState } from 'react';
import PhoneInput, { isPossiblePhoneNumber } from 'react-phone-number-input';
import styled from '@emotion/styled';

import { useRegisterCloseCellHandlers } from '../../hooks/useRegisterCloseCellHandlers';

import 'react-phone-number-input/style.css';

const StyledContainer = styled.div`
  align-items: center;

  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};

  display: flex;
  justify-content: center;
`;

export type PhoneCellEditProps = {
  placeholder?: string;
  autoFocus?: boolean;
  value: string;
  onSubmit: (newText: string) => void;
};

const StyledCustomPhoneInput = styled(PhoneInput)`
  --PhoneInput-color--focus: transparent;
  --PhoneInputCountryFlag-borderColor--focus: transparent;
  --PhoneInputCountrySelect-marginRight: ${({ theme }) => theme.spacing(2)};
  --PhoneInputCountrySelectArrow-color: ${({ theme }) =>
    theme.font.color.tertiary};
  --PhoneInputCountrySelectArrow-opacity: 1;
  font-family: ${({ theme }) => theme.font.family};
  height: 32px;

  .PhoneInputCountry {
    --PhoneInputCountryFlag-height: 12px;
    --PhoneInputCountryFlag-width: 16px;
    border-right: 1px solid ${({ theme }) => theme.border.color.light};
    display: flex;
    justify-content: center;
    margin-left: ${({ theme }) => theme.spacing(2)};
  }

  .PhoneInputCountryIcon {
    background: none;
    border-radius: ${({ theme }) => theme.border.radius.xs};
    box-shadow: none;
    margin-right: 1px;
    overflow: hidden;
    &:focus {
      box-shadow: none !important;
    }
  }

  .PhoneInputCountrySelectArrow {
    margin-right: ${({ theme }) => theme.spacing(2)};
  }

  .PhoneInputInput {
    background: ${({ theme }) => theme.background.transparent.secondary};
    border: none;
    color: ${({ theme }) => theme.font.color.primary};

    &::placeholder,
    &::-webkit-input-placeholder {
      color: ${({ theme }) => theme.font.color.light};
      font-family: ${({ theme }) => theme.font.family};
      font-weight: ${({ theme }) => theme.font.weight.medium};
    }

    :focus {
      outline: none;
    }
  }
`;

export function PhoneCellEdit({
  autoFocus,
  value,
  onSubmit,
}: PhoneCellEditProps) {
  const [internalValue, setInternalValue] = useState<string | undefined>(value);

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  function handleSubmit() {
    if (
      internalValue === undefined ||
      isPossiblePhoneNumber(internalValue ?? '')
    ) {
      onSubmit(internalValue ?? '');
    }
  }

  useRegisterCloseCellHandlers(wrapperRef, handleSubmit);

  return (
    <StyledContainer ref={wrapperRef}>
      <StyledCustomPhoneInput
        autoFocus={autoFocus}
        placeholder="Phone number"
        value={value}
        onChange={setInternalValue}
      />
    </StyledContainer>
  );
}
