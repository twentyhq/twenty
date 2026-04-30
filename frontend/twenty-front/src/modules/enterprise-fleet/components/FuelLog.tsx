import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { FuelEntry } from '../types/fleet.types';
import { GET_FLEET_ANALYTICS } from '../hooks/useFleet';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const StyledTh = styled.th`
  text-align: left;
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
`;

const StyledTd = styled.td`
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

const StyledAnomalyRow = styled.tr`
  background: ${themeCssVariables.background.transparent.lighter};
`;

const StyledFlag = styled.span`
  color: ${themeCssVariables.color.red};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledHideMobile = styled.td`
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
`;

const StyledHideMobileHeader = styled.th`
  text-align: left;
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
`;

export const FuelLog = () => {
  useLingui();

  const { data, loading, error } = useQuery(GET_FLEET_ANALYTICS);

  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;

  const fuelEntries: FuelEntry[] = data?.fleetAnalytics?.fuelLog ?? [];

  return (
    <StyledContainer>
      <StyledTitle>{t`Fuel Log`}</StyledTitle>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`Date`}</StyledTh>
            <StyledTh>{t`Plate`}</StyledTh>
            <StyledTh>{t`Liters`}</StyledTh>
            <StyledTh>{t`Total`}</StyledTh>
            <StyledHideMobileHeader>{t`Station`}</StyledHideMobileHeader>
            <StyledTh>{t`Flag`}</StyledTh>
          </tr>
        </thead>
        <tbody>
          {fuelEntries.map((entry) => {
            const Row = entry.hasAnomaly ? StyledAnomalyRow : 'tr';
            return (
              <Row key={entry.id}>
                <StyledTd>{entry.date}</StyledTd>
                <StyledTd>{entry.plate}</StyledTd>
                <StyledTd>{entry.liters}L</StyledTd>
                <StyledTd>${entry.totalCost.toFixed(2)}</StyledTd>
                <StyledHideMobile>{entry.station}</StyledHideMobile>
                <StyledTd>
                  {entry.hasAnomaly && <StyledFlag>{entry.anomalyReason}</StyledFlag>}
                </StyledTd>
              </Row>
            );
          })}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
