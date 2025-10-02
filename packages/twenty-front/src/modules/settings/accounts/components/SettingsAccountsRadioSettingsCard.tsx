import styled from '@emotion/styled';
import { type MessageDescriptor } from '@lingui/core';
import { Trans } from '@lingui/react';
import { type ReactNode } from 'react';
import { Radio } from 'twenty-ui/input';
import { Card, CardContent } from 'twenty-ui/layout';

type SettingsAccountsRadioSettingsCardProps<Option extends { value: string }> =
  {
    onChange: (nextValue: Option['value']) => void;
    options: Option[];
    value: Option['value'];
    name: string;
  };

const StyledCardContent = styled(CardContent)`
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

const StyledOptionHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
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

const StyledExpandedContent = styled.div`
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsAccountsRadioSettingsCard = <
  Option extends {
    cardMedia: ReactNode;
    description: MessageDescriptor;
    title: MessageDescriptor;
    value: string;
    cardContentExpanded?: ReactNode;
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
        <StyledOptionHeader>
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
        </StyledOptionHeader>
        {option.cardContentExpanded && value === option.value && (
          <StyledExpandedContent>
            {option.cardContentExpanded}
          </StyledExpandedContent>
        )}
      </StyledCardContent>
    ))}
  </Card>
);
