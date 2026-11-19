import { StyledControlContainer } from '@/ui/input/components/SelectControl';
import { styled } from '@linaria/react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { IconChevronDown } from 'twenty-ui/icon';
import { Chip } from 'twenty-ui/primitives/data-display';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledChips = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  overflow: hidden;
`;

const StyledIconChevronDownWrapper = styled.div<{ isDisabled: boolean }>`
  color: ${({ isDisabled }) =>
    isDisabled
      ? themeCssVariables.font.color.extraLight
      : themeCssVariables.font.color.tertiary};
  display: flex;
`;

type ConditionalAvailabilityValueControlProps = {
  labels: string[];
  placeholder: string;
  isDisabled: boolean;
};

export const ConditionalAvailabilityValueControl = ({
  labels,
  placeholder,
  isDisabled,
}: ConditionalAvailabilityValueControlProps) => {
  const theme = useTheme();
  const hasLabels = isNonEmptyArray(labels);

  return (
    <StyledControlContainer
      disabled={isDisabled}
      hasIcon={false}
      textAccent={hasLabels ? 'default' : 'placeholder'}
    >
      {hasLabels ? (
        <StyledChips>
          {labels.map((label, index) => (
            <Chip key={`${label}-${index}`} variant="soft">
              {label}
            </Chip>
          ))}
        </StyledChips>
      ) : (
        <OverflowingTextWithTooltip text={placeholder} />
      )}
      <StyledIconChevronDownWrapper isDisabled={isDisabled}>
        <IconChevronDown size={theme.icon.size.md} />
      </StyledIconChevronDownWrapper>
    </StyledControlContainer>
  );
};
