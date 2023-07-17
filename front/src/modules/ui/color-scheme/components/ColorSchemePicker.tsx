import React from 'react';
import styled from '@emotion/styled';

import { ColorScheme } from '@/ui/themes/states/colorSchemeState';

import { ColorSchemeCard } from './ColorSchemeCard';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${({ theme }) => theme.spacing(4)};
  }
`;

export type ColorSchemePickerProps = {
  value: ColorScheme;
  onChange: (value: ColorScheme) => void;
};

export function ColorSchemePicker({ value, onChange }: ColorSchemePickerProps) {
  return (
    <StyledContainer>
      <ColorSchemeCard
        onClick={() => onChange(ColorScheme.Light)}
        variant="light"
        selected={value === ColorScheme.Light}
      />
      <ColorSchemeCard
        onClick={() => onChange(ColorScheme.Dark)}
        variant="dark"
        selected={value === ColorScheme.Dark}
      />
      <ColorSchemeCard
        onClick={() => onChange(ColorScheme.System)}
        variant="system"
        selected={value === ColorScheme.System}
      />
    </StyledContainer>
  );
}
