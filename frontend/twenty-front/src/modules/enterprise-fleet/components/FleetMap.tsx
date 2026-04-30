import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { VehicleData, VehicleStatus } from '../types/fleet.types';

const MOCK_VEHICLES: VehicleData[] = [
  { id: 'V1', plate: 'ABC-123', model: 'Ford Transit', driver: 'Juan Perez', status: 'in_transit', lastLocation: 'Bogota Norte', mileage: 45200 },
  { id: 'V2', plate: 'DEF-456', model: 'Mercedes Sprinter', driver: 'Carlos Ruiz', status: 'available', lastLocation: 'Depot Central', mileage: 32100 },
  { id: 'V3', plate: 'GHI-789', model: 'Iveco Daily', driver: 'Pedro Gomez', status: 'maintenance', lastLocation: 'Taller Sur', mileage: 78500 },
  { id: 'V4', plate: 'JKL-012', model: 'Renault Master', driver: 'Luis Reyes', status: 'in_transit', lastLocation: 'Cali Centro', mileage: 21300 },
  { id: 'V5', plate: 'MNO-345', model: 'Ford Transit', driver: 'Ana Torres', status: 'offline', lastLocation: 'Unknown', mileage: 55000 },
];

const STATUS_COLORS: Record<VehicleStatus, string> = {
  available: themeCssVariables.color.turquoise,
  in_transit: themeCssVariables.color.blue,
  maintenance: themeCssVariables.color.yellow,
  offline: themeCssVariables.color.red,
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[2]};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${themeCssVariables.spacing[1]};
  }
`;

const StyledDot = styled.span<{ color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ color }) => color};
  flex-shrink: 0;
`;

const StyledPlate = styled.span`
  font-weight: ${themeCssVariables.font.weight.medium};
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  min-width: 90px;
`;

const StyledInfo = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
  min-width: 140px;
`;

const StyledLocation = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
`;

export const FleetMap = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Fleet Overview`}</StyledTitle>
      <StyledList>
        {MOCK_VEHICLES.map((vehicle) => (
          <StyledRow key={vehicle.id}>
            <StyledDot color={STATUS_COLORS[vehicle.status]} />
            <StyledPlate>{vehicle.plate}</StyledPlate>
            <StyledInfo>{vehicle.model}</StyledInfo>
            <StyledInfo>{vehicle.driver}</StyledInfo>
            <StyledLocation>{vehicle.lastLocation}</StyledLocation>
            <StyledInfo>{vehicle.status.replace('_', ' ')}</StyledInfo>
          </StyledRow>
        ))}
      </StyledList>
    </StyledContainer>
  );
};
