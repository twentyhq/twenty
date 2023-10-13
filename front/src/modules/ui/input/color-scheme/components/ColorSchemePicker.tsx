import React from 'react';
import styled from '@emotion/styled';

import { ColorScheme } from '~/generated/graphql';

import { ColorSchemeCard } from './ColorSchemeCard';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${({ theme }) => theme.spacing(4)};
  }
`;

const StyledCardContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

export type ColorSchemePickerProps = {
  value: ColorScheme;
  onChange: (value: ColorScheme) => void;
};

export const ColorSchemePicker = ({
  value,
  onChange,
}: ColorSchemePickerProps) => (
  <StyledContainer>
    <StyledCardContainer>
      <ColorSchemeCard
        onClick={() => onChange(ColorScheme.Light)}
        variant="light"
        selected={value === ColorScheme.Light}
      />
      <StyledLabel>Light</StyledLabel>
    </StyledCardContainer>
    <StyledCardContainer>
      <ColorSchemeCard
        onClick={() => onChange(ColorScheme.Dark)}
        variant="dark"
        selected={value === ColorScheme.Dark}
      />
      <StyledLabel>Dark</StyledLabel>
    </StyledCardContainer>
    <StyledCardContainer>
      <ColorSchemeCard
        onClick={() => onChange(ColorScheme.System)}
        variant="system"
        selected={value === ColorScheme.System}
      />
      <StyledLabel>System settings</StyledLabel>
    </StyledCardContainer>
  </StyledContainer>
);
