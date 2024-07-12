import React from 'react';
import styled from '@emotion/styled';

import { WorkspaceMemberColorSchemeEnum } from '~/generated/graphql';

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
  value: WorkspaceMemberColorSchemeEnum;
  className?: string;
  onChange: (value: WorkspaceMemberColorSchemeEnum) => void;
};

export const ColorSchemePicker = ({
  value,
  onChange,
  className,
}: ColorSchemePickerProps) => (
  <StyledContainer className={className}>
    <StyledCardContainer>
      <ColorSchemeCard
        onClick={() => onChange(WorkspaceMemberColorSchemeEnum.Light)}
        variant="Light"
        selected={value === WorkspaceMemberColorSchemeEnum.Light}
      />
      <StyledLabel>Light</StyledLabel>
    </StyledCardContainer>
    <StyledCardContainer>
      <ColorSchemeCard
        onClick={() => onChange(WorkspaceMemberColorSchemeEnum.Dark)}
        variant="Dark"
        selected={value === WorkspaceMemberColorSchemeEnum.Dark}
      />
      <StyledLabel>Dark</StyledLabel>
    </StyledCardContainer>
    <StyledCardContainer>
      <ColorSchemeCard
        onClick={() => onChange(WorkspaceMemberColorSchemeEnum.System)}
        variant="System"
        selected={value === WorkspaceMemberColorSchemeEnum.System}
      />
      <StyledLabel>System settings</StyledLabel>
    </StyledCardContainer>
  </StyledContainer>
);
