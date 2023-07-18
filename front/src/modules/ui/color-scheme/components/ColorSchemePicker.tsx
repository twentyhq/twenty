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

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

export type ColorSchemePickerProps = {
  value: ColorScheme;
  onChange: (value: ColorScheme) => void;
};

export function ColorSchemePicker({ value, onChange }: ColorSchemePickerProps) {
  return (
    <StyledContainer>
      <CardContainer>
        <ColorSchemeCard
          onClick={() => onChange(ColorScheme.Light)}
          variant="light"
          selected={value === ColorScheme.Light}
        />
        <Label>Light</Label>
      </CardContainer>
      <CardContainer>
        <ColorSchemeCard
          onClick={() => onChange(ColorScheme.Dark)}
          variant="dark"
          selected={value === ColorScheme.Dark}
        />
        <Label>Dark</Label>
      </CardContainer>
      <CardContainer>
        <ColorSchemeCard
          onClick={() => onChange(ColorScheme.System)}
          variant="system"
          selected={value === ColorScheme.System}
        />
        <Label>System settings</Label>
      </CardContainer>
    </StyledContainer>
  );
}
