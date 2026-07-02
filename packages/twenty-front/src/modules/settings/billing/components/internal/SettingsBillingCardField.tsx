import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { type TablerIconsProps } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables, useTheme } from 'twenty-ui/theme-constants';

const StyledBillingFieldRow = styled.div`
  align-items: center;
  display: grid;
  gap: ${themeCssVariables.spacing[1]};
  grid-template-columns: 92px minmax(0, 1fr);
  min-height: 24px;
`;

const StyledBillingFieldLabel = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledBillingFieldValue = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  min-width: 0;
`;

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

type BillingFieldRowProps = {
  Icon: (props: TablerIconsProps) => ReactNode;
  label: string;
  children: ReactNode;
};

export const BillingFieldRow = ({
  Icon,
  label,
  children,
}: BillingFieldRowProps) => {
  const theme = useTheme();

  return (
    <StyledBillingFieldRow>
      <StyledBillingFieldLabel>
        <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        <OverflowingTextWithTooltip text={label} />
      </StyledBillingFieldLabel>
      <StyledBillingFieldValue>{children}</StyledBillingFieldValue>
    </StyledBillingFieldRow>
  );
};

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
      <StyledBillingFieldLabel>
        <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        <OverflowingTextWithTooltip text={label} />
      </StyledBillingFieldLabel>
      <StyledBillingFieldValue>{value}</StyledBillingFieldValue>
    </StyledScheduledChangeItem>
  );
};
