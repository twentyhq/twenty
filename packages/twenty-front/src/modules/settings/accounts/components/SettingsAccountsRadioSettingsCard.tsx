import styled from '@emotion/styled';
import { MessageDescriptor } from '@lingui/core';
import { Trans } from '@lingui/react';
import { ReactNode } from 'react';
import { Card, CardContent } from 'twenty-ui/layout';
import { Radio } from 'twenty-ui/input';

type SettingsAccountsRadioSettingsCardProps<Option extends { value: string }> =
  {
    onChange: (nextValue: Option['value']) => void;
    options: Option[];
    value: Option['value'];
    name: string;
  };

const StyledCardContent = styled(CardContent)`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledDescription = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledRadio = styled(Radio)`
  margin-left: auto;
`;

export const SettingsAccountsRadioSettingsCard = <
  Option extends {
    cardMedia: ReactNode;
    description: MessageDescriptor;
    title: MessageDescriptor;
    value: string;
  },
>({
  onChange,
  options,
  value,
  name,
}: SettingsAccountsRadioSettingsCardProps<Option>) => (
  <Card rounded>
    {options.map((option, index) => (
      <StyledCardContent
        key={option.value}
        divider={index < options.length - 1}
        onClick={() => onChange(option.value)}
      >
        {option.cardMedia}
        <div>
          <StyledTitle>
            <Trans id={option.title.id} />
          </StyledTitle>
          <StyledDescription>
            <Trans id={option.description.id} />
          </StyledDescription>
        </div>
        <StyledRadio
          name={name}
          value={option.value}
          onCheckedChange={() => onChange(option.value)}
          checked={value === option.value}
        />
      </StyledCardContent>
    ))}
  </Card>
);
