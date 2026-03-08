import { styled } from '@linaria/react';
import { type MessageDescriptor } from '@lingui/core';
import { Trans } from '@lingui/react';
import { type ReactNode } from 'react';
import { Radio } from 'twenty-ui/input';
import { Card, CardContent } from 'twenty-ui/layout';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsAccountsRadioSettingsCardProps<Option extends { value: string }> =
  {
    onChange: (nextValue: Option['value']) => void;
    options: Option[];
    value: Option['value'];
    name: string;
  };

const StyledCardContentContainer = styled.div`
  > * {
    cursor: pointer;

    &:hover {
      background: ${themeCssVariables.background.transparent.lighter};
    }
  }
`;

const StyledOptionHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledDescription = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledRadioContainer = styled.span`
  align-items: center;
  display: flex;
  margin-left: auto;
`;

const StyledExpandedContent = styled.div`
  margin-top: ${themeCssVariables.spacing[4]};
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
      <StyledCardContentContainer key={option.value}>
        <CardContent
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
            <StyledRadioContainer>
              <Radio
                name={name}
                value={option.value}
                onCheckedChange={() => onChange(option.value)}
                checked={value === option.value}
              />
            </StyledRadioContainer>
          </StyledOptionHeader>
          {isDefined(option.cardContentExpanded) && value === option.value && (
            <StyledExpandedContent>
              {option.cardContentExpanded}
            </StyledExpandedContent>
          )}
        </CardContent>
      </StyledCardContentContainer>
    ))}
  </Card>
);
