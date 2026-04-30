import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { TechnicianData } from '../types/fsm.types';

const MOCK_TECHNICIANS: TechnicianData[] = [
  { id: 'T1', name: 'Juan Perez', specialty: 'HVAC', status: 'on_job', currentLocation: 'Bogota Norte', activeWorkOrders: 1, completedToday: 2 },
  { id: 'T2', name: 'Pedro Gomez', specialty: 'Electrical', status: 'available', currentLocation: 'Depot Central', activeWorkOrders: 0, completedToday: 3 },
  { id: 'T3', name: 'Diego Vargas', specialty: 'Plumbing', status: 'on_job', currentLocation: 'Medellin Centro', activeWorkOrders: 2, completedToday: 1 },
  { id: 'T4', name: 'Camila Ortiz', specialty: 'Fire Safety', status: 'off_duty', currentLocation: '—', activeWorkOrders: 0, completedToday: 0 },
];

const STATUS_COLORS: Record<string, string> = {
  available: themeCssVariables.color.turquoise,
  on_job: themeCssVariables.color.blue,
  off_duty: themeCssVariables.color.gray50,
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

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: ${themeCssVariables.spacing[3]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

const StyledCard = styled.div`
  padding: ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledDot = styled.span<{ color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ color }) => color};
`;

const StyledName = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledDetail = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
`;

export const DispatchBoard = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Dispatch Board`}</StyledTitle>
      <StyledGrid>
        {MOCK_TECHNICIANS.map((tech) => (
          <StyledCard key={tech.id}>
            <StyledHeader>
              <StyledDot color={STATUS_COLORS[tech.status]} />
              <StyledName>{tech.name}</StyledName>
            </StyledHeader>
            <StyledDetail>{tech.specialty} - {tech.status.replace('_', ' ')}</StyledDetail>
            <StyledDetail>{tech.currentLocation}</StyledDetail>
            <StyledRow>
              <span>{t`Active`}: {tech.activeWorkOrders}</span>
              <span>{t`Done today`}: {tech.completedToday}</span>
            </StyledRow>
          </StyledCard>
        ))}
      </StyledGrid>
    </StyledContainer>
  );
};
