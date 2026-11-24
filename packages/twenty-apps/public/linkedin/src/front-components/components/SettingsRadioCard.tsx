import styled from '@emotion/styled';
import { Fragment, type ReactNode, useId } from 'react';
import { isDefined } from 'twenty-sdk/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { Radio } from 'src/front-components/components/Radio';
import { Separator } from 'src/front-components/components/Separator';
import { StyledSettingsCardTextContainer } from 'src/front-components/components/SettingsCardContentBase';
import { StyledSettingsCard } from 'src/front-components/components/StyledSettingsCard';

const StyledOptionRow = styled.div`
  align-items: center;
  background-color: ${() => themeCssVariables.background.secondary};
  cursor: pointer;
  display: flex;
  gap: ${() => themeCssVariables.spacing[4]};
  padding: ${() => themeCssVariables.spacing[4]};

  &:hover {
    background: ${() => themeCssVariables.background.transparent.lighter};
  }
`;

const StyledOptionTitle = styled.div`
  color: ${() => themeCssVariables.font.color.primary};
  font-weight: ${() => themeCssVariables.font.weight.medium};
  margin-bottom: ${() => themeCssVariables.spacing[2]};
`;

const StyledOptionDescription = styled.div`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-size: ${() => themeCssVariables.font.size.sm};
`;

const StyledExpandedContent = styled.div`
  background-color: ${() => themeCssVariables.background.secondary};
  padding: 0 ${() => themeCssVariables.spacing[4]}
    ${() => themeCssVariables.spacing[4]};
`;

const StyledRadioContainer = styled.span`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  margin-left: auto;
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
    <StyledSettingsCard role="radiogroup">
      {options.map((option, index) => {
        const titleId = `${groupId}-${index}-title`;
        const descriptionId = `${groupId}-${index}-description`;

        return (
          <Fragment key={option.value}>
            <StyledOptionRow onClick={() => onChange(option.value)}>
              {option.cardMedia}
              <StyledSettingsCardTextContainer>
                <StyledOptionTitle id={titleId}>
                  {option.title}
                </StyledOptionTitle>
                <StyledOptionDescription id={descriptionId}>
                  {option.description}
                </StyledOptionDescription>
              </StyledSettingsCardTextContainer>
              <StyledRadioContainer>
                <Radio
                  checked={option.value === value}
                  aria-labelledby={titleId}
                  aria-describedby={descriptionId}
                  onSelect={() => onChange(option.value)}
                />
              </StyledRadioContainer>
            </StyledOptionRow>
            {option.value === value &&
              isDefined(option.cardContentExpanded) && (
                <StyledExpandedContent>
                  {option.cardContentExpanded}
                </StyledExpandedContent>
              )}
            {index < options.length - 1 && <Separator />}
          </Fragment>
        );
      })}
    </StyledSettingsCard>
  );
};
