import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { type MessageDescriptor } from '@lingui/core';
import { useLingui } from '@lingui/react/macro';
import { Fragment, type ReactNode, useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Radio, RadioGroup } from 'twenty-ui/primitives/input';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

type SettingsRadioSettingsCardProps<Option extends { value: string }> = {
  name: string;
  onChange: (nextValue: Option['value']) => void;
  options: Option[];
  value: Option['value'];
  disabled?: boolean;
};

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

const EXPANDED_CONTENT_CLASS_NAME = css`
  padding-top: ${themeCssVariables.spacing[0]};
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
  disabled = false,
}: SettingsRadioSettingsCardProps<Option>) => {
  const groupId = useId();
  const { i18n } = useLingui();

  return (
    <RadioGroup
      name={name}
      value={value}
      onValueChange={onChange}
      disabled={disabled}
      onKeyDown={(event) => {
        if (
          !(event.target instanceof HTMLElement) ||
          event.target.getAttribute('role') !== 'radio'
        ) {
          event.preventBaseUIHandler();
        }
      }}
    >
      <Card.Root fullWidth>
        {options.map((option, index) => {
          const isSelected = value === option.value;
          const hasExpandedContent =
            isDefined(option.cardContentExpanded) && isSelected;
          const hasDivider = index < options.length - 1;
          const radioId = `${groupId}-${index}`;

          return (
            <Fragment key={option.value}>
              <Card.Content divider={hasDivider && !hasExpandedContent}>
                <Card.Action
                  disabled={disabled}
                  render={
                    <label
                      htmlFor={radioId}
                      aria-labelledby={`${groupId}-${index}-title`}
                    />
                  }
                />
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
                  <Card.Control render={<StyledRadioContainer />}>
                    <Radio
                      id={radioId}
                      aria-labelledby={`${groupId}-${index}-title`}
                      aria-describedby={`${groupId}-${index}-description`}
                      value={option.value}
                    />
                  </Card.Control>
                </StyledOptionHeader>
              </Card.Content>
              {hasExpandedContent && (
                <Card.Content
                  className={EXPANDED_CONTENT_CLASS_NAME}
                  divider={hasDivider}
                >
                  {option.cardContentExpanded}
                </Card.Content>
              )}
            </Fragment>
          );
        })}
      </Card.Root>
    </RadioGroup>
  );
};
