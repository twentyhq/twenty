import { styled } from '@linaria/react';
import { Fragment, useContext } from 'react';
import { type IconComponent } from 'twenty-ui/display';
import {
  ThemeContext,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

export type SettingsStatRow = {
  Icon: IconComponent;
  label: string;
  value: string;
};

type SettingsStatsGridProps = {
  columns: SettingsStatRow[][];
};

const StyledContainer = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledColumn = styled.div`
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledDivider = styled.div`
  align-self: stretch;
  background: ${themeCssVariables.border.color.light};
  width: 1px;
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  height: ${themeCssVariables.spacing[6]};
`;

const StyledLabel = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  flex: 1 1 0;
  font-size: ${themeCssVariables.font.size.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledValue = styled.div`
  color: ${themeCssVariables.font.color.primary};
  padding: 0 ${themeCssVariables.spacing[1]};
`;

type StatRowProps = SettingsStatRow;

const StatRow = ({ Icon, label, value }: StatRowProps) => {
  const { theme } = useContext(ThemeContext);
  return (
    <StyledRow>
      <Icon size={theme.icon.size.md} color={theme.font.color.tertiary} />
      <StyledLabel>{label}</StyledLabel>
      <StyledValue>{value}</StyledValue>
    </StyledRow>
  );
};

export const SettingsStatsGrid = ({ columns }: SettingsStatsGridProps) => (
  <StyledContainer>
    {columns.map((column, index) => (
      <Fragment key={index}>
        {index > 0 && <StyledDivider />}
        <StyledColumn>
          {column.map((stat) => (
            <StatRow
              key={stat.label}
              Icon={stat.Icon}
              label={stat.label}
              value={stat.value}
            />
          ))}
        </StyledColumn>
      </Fragment>
    ))}
  </StyledContainer>
);
