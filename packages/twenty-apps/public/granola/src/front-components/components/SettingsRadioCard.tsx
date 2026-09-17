import styled from '@emotion/styled';
import { Fragment, useId } from 'react';
import { isDefined } from 'twenty-sdk/utils';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { Radio } from 'src/front-components/components/Radio';
import { Separator } from 'src/front-components/components/Separator';
import {
  StyledSettingsCardDescription,
  StyledSettingsCardTextContainer,
  StyledSettingsCardTitle,
} from 'src/front-components/components/SettingsCardContentBase';
import { StyledSettingsCard } from 'src/front-components/components/StyledSettingsCard';

const StyledOptionRow = styled.div<{ $disabled: boolean }>`
  align-items: center;
  background-color: ${() => themeCssVariables.background.secondary};
  cursor: ${({ $disabled }) => ($disabled ? 'default' : 'pointer')};
  display: flex;
  gap: ${() => themeCssVariables.spacing[4]};
  padding: ${() => themeCssVariables.spacing[4]};
  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};

  &:hover {
    background: ${() => themeCssVariables.background.transparent.lighter};
  }
`;

const StyledRadioContainer = styled.span`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  margin-left: auto;
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
  value: TValue;
  disabled?: boolean;
  onChange: (value: TValue) => void;
};

export const SettingsRadioCard = <TValue extends string>({
  options,
  value,
  disabled = false,
  onChange,
}: SettingsRadioCardProps<TValue>) => {
  const groupId = useId();

  return (
    <StyledSettingsCard role="radiogroup">
      {options.map((option, index) => {
        const isSelected = option.value === value;
        const titleId = `${groupId}-${index}-title`;
        const descriptionId = `${groupId}-${index}-description`;

        return (
          <Fragment key={option.value}>
            <StyledOptionRow
              $disabled={disabled}
              onClick={() => onChange(option.value)}
            >
              {option.cardMedia}
              <StyledSettingsCardTextContainer>
                <StyledSettingsCardTitle id={titleId}>
                  {option.title}
                </StyledSettingsCardTitle>
                <StyledSettingsCardDescription id={descriptionId}>
                  <OverflowingTextWithTooltip text={option.description} />
                </StyledSettingsCardDescription>
              </StyledSettingsCardTextContainer>
              <StyledRadioContainer>
                <Radio
                  checked={isSelected}
                  disabled={disabled}
                  aria-labelledby={titleId}
                  aria-describedby={descriptionId}
                  onSelect={() => onChange(option.value)}
                />
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
