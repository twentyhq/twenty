import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Fragment, useId } from 'react';
import { t } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { Radio } from 'src/front-components/components/Radio';
import { Separator } from 'src/front-components/components/Separator';
import { StyledSettingsCardTextContainer } from 'src/front-components/components/SettingsCardContentBase';
import { SettingsControlLoader } from 'src/front-components/components/SettingsControlLoader';
import { StyledSettingsCard } from 'src/front-components/components/StyledSettingsCard';

const StyledOptionRow = styled.div<{ $isClickable: boolean }>`
  align-items: center;
  background-color: ${() => themeCssVariables.background.secondary};
  display: flex;
  gap: ${() => themeCssVariables.spacing[4]};
  padding: ${() => themeCssVariables.spacing[4]};

  ${({ $isClickable }) =>
    $isClickable &&
    css`
      cursor: pointer;

      &:hover {
        background: ${themeCssVariables.background.transparent.lighter};
      }
    `}
`;

// Mirrors twenty-front's SettingsRadioSettingsCard: descriptions wrap, unlike the option card rows.
const StyledOptionTitle = styled.div`
  color: ${() => themeCssVariables.font.color.primary};
  font-weight: ${() => themeCssVariables.font.weight.medium};
  margin-bottom: ${() => themeCssVariables.spacing[2]};
`;

const StyledOptionDescription = styled.div`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-size: ${() => themeCssVariables.font.size.sm};
`;

const StyledRadioContainer = styled.span`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  margin-left: auto;
`;

// Sits where the radio control sits inside its 3px button padding.
const StyledRadioLoaderContainer = styled.span`
  display: flex;
  padding: 3px;
`;

const StyledExpandedContent = styled.div`
  background-color: ${() => themeCssVariables.background.secondary};
  padding: 0 ${() => themeCssVariables.spacing[4]}
    ${() => themeCssVariables.spacing[4]};
`;

export type SettingsRadioCardOption<TValue extends string> = {
  value: TValue;
  cardMedia: React.ReactNode;
  title: string;
  description: string;
  expandedContent?: React.ReactNode;
};

type SettingsRadioCardProps<TValue extends string> = {
  options: SettingsRadioCardOption<TValue>[];
  value: TValue | undefined;
  onChange: (value: TValue) => void;
};

export const SettingsRadioCard = <TValue extends string>({
  options,
  value,
  onChange,
}: SettingsRadioCardProps<TValue>) => {
  const groupId = useId();
  const isValueKnown = isDefined(value);

  return (
    <StyledSettingsCard
      role="radiogroup"
      aria-busy={!isValueKnown}
      aria-label={isValueKnown ? undefined : t('Loading')}
    >
      {options.map((option, index) => {
        const isSelected = option.value === value;
        const titleId = `${groupId}-${index}-title`;
        const descriptionId = `${groupId}-${index}-description`;

        return (
          <Fragment key={option.value}>
            <StyledOptionRow
              $isClickable={isValueKnown}
              onClick={isValueKnown ? () => onChange(option.value) : undefined}
            >
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
                {isValueKnown ? (
                  <Radio
                    checked={isSelected}
                    aria-labelledby={titleId}
                    aria-describedby={descriptionId}
                    onSelect={() => onChange(option.value)}
                  />
                ) : (
                  <StyledRadioLoaderContainer>
                    <SettingsControlLoader />
                  </StyledRadioLoaderContainer>
                )}
              </StyledRadioContainer>
            </StyledOptionRow>
            {isSelected && isDefined(option.expandedContent) && (
              <StyledExpandedContent>
                {option.expandedContent}
              </StyledExpandedContent>
            )}
            {index < options.length - 1 && <Separator />}
          </Fragment>
        );
      })}
    </StyledSettingsCard>
  );
};
