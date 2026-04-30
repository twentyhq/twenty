import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { FuelEntry } from '../types/fleet.types';

const MOCK_FUEL: FuelEntry[] = [
  { id: 'F1', vehicleId: 'V1', plate: 'ABC-123', liters: 60, costPerLiter: 2.45, totalCost: 147, odometer: 45200, date: '2026-04-28', station: 'Terpel Norte', hasAnomaly: false },
  { id: 'F2', vehicleId: 'V2', plate: 'DEF-456', liters: 45, costPerLiter: 2.50, totalCost: 112.5, odometer: 32100, date: '2026-04-27', station: 'Primax Centro', hasAnomaly: false },
  { id: 'F3', vehicleId: 'V3', plate: 'GHI-789', liters: 120, costPerLiter: 2.45, totalCost: 294, odometer: 78500, date: '2026-04-27', station: 'Terpel Sur', hasAnomaly: true, anomalyReason: 'Volume exceeds tank capacity (80L)' },
  { id: 'F4', vehicleId: 'V4', plate: 'JKL-012', liters: 55, costPerLiter: 2.60, totalCost: 143, odometer: 21300, date: '2026-04-26', station: 'Biomax Cali', hasAnomaly: true, anomalyReason: 'Price per liter above market average' },
];

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
          {MOCK_FUEL.map((entry) => {
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
