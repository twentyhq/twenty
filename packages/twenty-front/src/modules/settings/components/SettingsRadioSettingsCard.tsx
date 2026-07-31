import { styled } from '@linaria/react';
import { type MessageDescriptor } from '@lingui/core';
import { Trans } from '@lingui/react';
import { type KeyboardEvent, type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Radio } from 'twenty-ui/input';
import { Card, CardContent } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsRadioSettingsCardProps<Option extends { value: string }> = {
  name: string;
  onChange: (nextValue: Option['value']) => void;
  options: Option[];
  value: Option['value'];
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

const StyledTextContainer = styled.div`
  flex: 1;
  min-width: 0;
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

export const SettingsRadioSettingsCard = <
  Option extends {
    cardMedia: ReactNode;
    description: MessageDescriptor;
    title: MessageDescriptor;
    value: string;
    cardContentExpanded?: ReactNode;
  },
>({
  name,
  onChange,
  options,
  value,
}: SettingsRadioSettingsCardProps<Option>) => {
  const handleKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    optionValue: Option['value'],
  ) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    onChange(optionValue);
  };

  return (
    <Card fullWidth rounded role="radiogroup">
      {options.map((option, index) => {
        const isSelected = value === option.value;

        return (
          <StyledCardContentContainer key={option.value}>
            <CardContent
              aria-checked={isSelected}
              divider={index < options.length - 1}
              onClick={() => onChange(option.value)}
              onKeyDown={(event) => handleKeyDown(event, option.value)}
              role="radio"
              tabIndex={0}
            >
              <StyledOptionHeader>
                {option.cardMedia}
                <StyledTextContainer>
                  <StyledTitle>
                    <Trans id={option.title.id} />
                  </StyledTitle>
                  <StyledDescription>
                    <Trans id={option.description.id} />
                  </StyledDescription>
                </StyledTextContainer>
                <StyledRadioContainer
                  onClick={(event) => event.stopPropagation()}
                >
                  <Radio
                    checked={isSelected}
                    name={name}
                    onCheckedChange={() => onChange(option.value)}
                    value={option.value}
                  />
                </StyledRadioContainer>
              </StyledOptionHeader>
              {isDefined(option.cardContentExpanded) && isSelected && (
                <StyledExpandedContent>
                  {option.cardContentExpanded}
                </StyledExpandedContent>
              )}
            </CardContent>
          </StyledCardContentContainer>
        );
      })}
    </Card>
  );
};
