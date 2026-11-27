import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { type TablerIconsProps } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import {
  StyledDetailFieldLabel,
  StyledDetailFieldValue,
} from '@/ui/layout/details/components/DetailFieldRow';

const StyledScheduledChangeItem = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: grid;
  gap: ${themeCssVariables.spacing[1]};
  grid-template-columns: 92px minmax(0, 1fr);
  min-height: 24px;
  min-width: 0;

  & + & {
    border-left: 1px solid ${themeCssVariables.background.transparent.light};
    padding-left: ${themeCssVariables.spacing[6]};
  }

  @media (max-width: 640px) {
    & + & {
      border-left: 0;
      border-top: 1px solid ${themeCssVariables.background.transparent.light};
      padding-left: 0;
      padding-top: ${themeCssVariables.spacing[3]};
    }

    &:not(:last-child) {
      padding-bottom: ${themeCssVariables.spacing[3]};
    }
  }
`;

const StyledIncludedBillingItem = styled(StyledScheduledChangeItem)`
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: max-content minmax(0, 1fr);
`;

export type ScheduledBillingChangeFieldProps = {
  Icon: (props: TablerIconsProps) => ReactNode;
  label: string;
  value: string;
};

export const ScheduledBillingChangeField = ({
  Icon,
  label,
  value,
}: ScheduledBillingChangeFieldProps) => {
  const theme = useTheme();

  return (
    <StyledScheduledChangeItem>
      <StyledDetailFieldLabel>
        <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        <OverflowingTextWithTooltip text={label} />
      </StyledDetailFieldLabel>
      <StyledDetailFieldValue>{value}</StyledDetailFieldValue>
    </StyledScheduledChangeItem>
  );
};

export type IncludedBillingFieldProps = ScheduledBillingChangeFieldProps;

export const IncludedBillingField = ({
  Icon,
  label,
  value,
}: IncludedBillingFieldProps) => {
  const theme = useTheme();

  return (
    <StyledIncludedBillingItem>
      <StyledDetailFieldLabel>
        <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        {label}
      </StyledDetailFieldLabel>
      <StyledDetailFieldValue>{value}</StyledDetailFieldValue>
    </StyledIncludedBillingItem>
  );
};
