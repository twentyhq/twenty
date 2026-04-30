import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { TechnicianData } from '../types/fsm.types';
import { GET_AVAILABLE_TECHNICIANS } from '../hooks/useFSM';

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
  @media (max-width: ${MOBILE_VIEWPORT}px) { grid-template-columns: 1fr; }
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

  const { data, loading, error } = useQuery(GET_AVAILABLE_TECHNICIANS);

  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;

  const technicians: TechnicianData[] = data?.availableTechnicians?.technicians ?? [];

  return (
    <StyledContainer>
      <StyledTitle>{t`Dispatch Board`}</StyledTitle>
      <StyledGrid>
        {technicians.map((tech) => (
          <StyledCard key={tech.id}>
            <StyledHeader>
              <StyledDot color={STATUS_COLORS[tech.status] ?? themeCssVariables.color.gray50} />
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
