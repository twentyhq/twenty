import { styled } from '@linaria/react';
import { type MessageDescriptor } from '@lingui/core';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Radio, RadioGroup } from 'twenty-ui/input';
import { Card, CardContent } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsRadioSettingsCardProps<Option extends { value: string }> = {
  name: string;
  onChange: (nextValue: Option['value']) => void;
  options: Option[];
  value: Option['value'];
};

const StyledCardContentContainer = styled.div`
  > div {
    cursor: pointer;

    &:hover {
      background: ${themeCssVariables.background.transparent.lighter};
    }
  }
`;

const StyledOptionHeader = styled.label`
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
  const groupId = useId();
  const { i18n } = useLingui();

  return (
    <RadioGroup name={name} value={value} onValueChange={onChange}>
      <Card fullWidth rounded>
        {options.map((option, index) => {
          const isSelected = value === option.value;

          return (
            <StyledCardContentContainer key={option.value}>
              <CardContent divider={index < options.length - 1}>
                <StyledOptionHeader>
                  {option.cardMedia}
                  <StyledTextContainer>
                    <StyledTitle id={`${groupId}-${index}-title`}>
                      {i18n._(option.title)}
                    </StyledTitle>
                    <StyledDescription id={`${groupId}-${index}-description`}>
                      {i18n._(option.description)}
                    </StyledDescription>
                  </StyledTextContainer>
                  <StyledRadioContainer>
                    <Radio
                      aria-labelledby={`${groupId}-${index}-title`}
                      aria-describedby={`${groupId}-${index}-description`}
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
    </RadioGroup>
  );
};
