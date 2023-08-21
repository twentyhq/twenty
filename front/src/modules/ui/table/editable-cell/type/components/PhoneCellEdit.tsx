import { ChangeEvent, useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import intlTelInput from 'intl-tel-input';

import { hoverBackground } from '@/ui/theme/constants/effects';

import countries from '../../../constants/countries.json';
import { useRegisterCloseCellHandlers } from '../../hooks/useRegisterCloseCellHandlers';

import 'intl-tel-input/build/css/intlTelInput.css';

const StyledContainer = styled.div`
  align-items: center;

  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};

  display: flex;
  justify-content: center;

  .iti__country-list {
    background: ${({ theme }) => theme.background.secondary};
    border: 1px solid ${({ theme }) => theme.border.color.medium};
    border-radius: ${({ theme }) => theme.border.radius.md};
    box-shadow: ${({ theme }) => theme.boxShadow.strong};

    .iti__country {
      --horizontal-padding: ${({ theme }) => theme.spacing(1)};
      --vertical-padding: ${({ theme }) => theme.spacing(3)};

      border-radius: ${({ theme }) => theme.border.radius.sm};
      color: ${({ theme }) => theme.font.color.secondary};

      cursor: pointer;

      font-size: ${({ theme }) => theme.font.size.sm};

      gap: ${({ theme }) => theme.spacing(1)};

      height: calc(32px - 2 * var(--vertical-padding));

      padding: var(--vertical-padding) var(--horizontal-padding);

      ${hoverBackground};

      width: calc(100% - 2 * var(--horizontal-padding));
    }
  }

  .iti__flag {
    background-color: ${({ theme }) => theme.background.secondary};
  }

  .iti__arrow {
    align-items: center;
    display: flex;
    justify-content: center;
  }
`;

const StyledInput = styled.input`
  background: ${({ theme }) => theme.background.primary};
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme }) => theme.font.color.primary};

  margin: 0;

  outline: none;
  padding: ${({ theme }) => theme.spacing(2)};

  width: ${({ theme }) => theme.spacing(48)};
`;

type OwnProps = {
  placeholder?: string;
  autoFocus?: boolean;
  value: string;
  onSubmit: (newText: string) => void;
};

export function PhoneCellEdit({
  placeholder,
  autoFocus,
  value,
  onSubmit,
}: OwnProps) {
  const [internalText, setInternalText] = useState(value);
  const phoneInputRef = useRef<HTMLInputElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  function handleSubmit() {
    onSubmit(internalText);
  }

  function handleCancel() {
    setInternalText(value);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setInternalText(event.target.value);
    const inputElement = phoneInputRef.current;
    console.log(inputElement);
  }

  useEffect(() => {
    setInternalText(value);
  }, [value]);

  useEffect(() => {
    if (phoneInputRef.current) {
      intlTelInput(phoneInputRef.current, {
        utilsScript:
          'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/8.4.6/js/utils.js',
        initialCountry: 'auto',
        formatOnDisplay: true,
        localizedCountries: countries,
        onlyCountries: Object.keys(countries),
        preferredCountries: [],
      });
    }
  }, [value]);

  useRegisterCloseCellHandlers(wrapperRef, handleSubmit, handleCancel);

  return (
    <StyledContainer ref={wrapperRef}>
      <StyledInput
        type="tel"
        autoFocus={autoFocus}
        ref={phoneInputRef}
        onChange={handleChange}
        value={internalText}
      />
    </StyledContainer>
  );
}
