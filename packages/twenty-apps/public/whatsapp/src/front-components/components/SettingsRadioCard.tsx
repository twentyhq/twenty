import styled from '@emotion/styled';
import { Fragment, type ReactNode, useId } from 'react';
import { isDefined } from 'twenty-sdk/utils';
import { Radio, RadioGroup } from 'twenty-ui/primitives/input';
import { Card } from 'twenty-ui/primitives/surfaces';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { SettingsCardSeparator } from 'src/front-components/components/SettingsCardSeparator';
import { StyledSettingsCardControlContainer } from 'src/front-components/components/SettingsCardContentBase';

const StyledOptionRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${() => themeCssVariables.spacing[4]};
`;

const StyledExpandedContent = styled.div`
  && {
    padding-top: 0;
  }
`;

const StyledOptionTextContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[2]};
  min-width: 0;
`;

export type SettingsRadioCardOption<TValue extends string> = {
  value: TValue;
  cardMedia: ReactNode;
  title: string;
  description: string;
  cardContentExpanded?: ReactNode;
};

type SettingsRadioCardProps<TValue extends string> = {
  options: SettingsRadioCardOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
};

export const SettingsRadioCard = <TValue extends string>({
  options,
  value,
  onChange,
}: SettingsRadioCardProps<TValue>) => {
  const groupId = useId();

  return (
    <RadioGroup
      value={value}
      onValueChange={onChange}
      onKeyDown={(event) => {
        // Arrow keys pressed elsewhere in a row would otherwise move the selection
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
          const radioId = `${groupId}-${index}`;
          const titleId = `${radioId}-title`;
          const descriptionId = `${radioId}-description`;

          return (
            <Fragment key={option.value}>
              <Card.Content>
                <Card.Action
                  render={<label htmlFor={radioId} aria-labelledby={titleId} />}
                />
                <StyledOptionRow>
                  {option.cardMedia}
                  <StyledOptionTextContainer>
                    <Text id={titleId} weight="medium" color="primary">
                      {option.title}
                    </Text>
                    <Text id={descriptionId} size="sm" color="tertiary">
                      {option.description}
                    </Text>
                  </StyledOptionTextContainer>
                  <Card.Control render={<StyledSettingsCardControlContainer />}>
                    <Radio
                      id={radioId}
                      value={option.value}
                      aria-labelledby={titleId}
                      aria-describedby={descriptionId}
                    />
                  </Card.Control>
                </StyledOptionRow>
              </Card.Content>
              {option.value === value &&
                isDefined(option.cardContentExpanded) && (
                  <Card.Content render={<StyledExpandedContent />}>
                    {option.cardContentExpanded}
                  </Card.Content>
                )}
              {index < options.length - 1 && <SettingsCardSeparator />}
            </Fragment>
          );
        })}
      </Card.Root>
    </RadioGroup>
  );
};
