import { useMutation, useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import {
  GET_ACTIVE_MODULES,
  TOGGLE_AI_MODULE,
} from '../hooks/useAI';

type ModuleStatus = 'active' | 'paused' | 'error' | 'training';

const STATUS_COLORS: Record<ModuleStatus, string> = {
  active: themeCssVariables.color.turquoise,
  paused: themeCssVariables.color.yellow,
  error: themeCssVariables.color.red,
  training: themeCssVariables.color.blue,
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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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
  justify-content: space-between;
  align-items: center;
`;

const StyledName = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledDot = styled.span<{ color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ color }) => color};
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

const StyledModel = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  padding: 2px 6px;
  border-radius: 4px;
  background: ${themeCssVariables.background.transparent.medium};
  color: ${themeCssVariables.font.color.secondary};
  align-self: flex-start;
`;

const StyledToggle = styled.button<{ isActive: boolean }>`
  padding: 4px 12px;
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 4px;
  background: ${({ isActive }) =>
    isActive ? themeCssVariables.color.turquoise : themeCssVariables.color.gray50};
  color: ${themeCssVariables.font.color.inverted};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledLoading = styled.div`
  padding: ${themeCssVariables.spacing[4]};
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledError = styled.div`
  padding: ${themeCssVariables.spacing[4]};
  color: ${themeCssVariables.color.red};
`;

export const AIAgentList = () => {
  useLingui();

  const { data, loading, error, refetch } = useQuery(GET_ACTIVE_MODULES);

  const [toggleModule] = useMutation(TOGGLE_AI_MODULE, {
    onCompleted: () => refetch(),
  });

  const handleToggle = (moduleId: string, currentStatus: string) => {
    const isCurrentlyActive = currentStatus === 'active';
    toggleModule({
      variables: { moduleId, enabled: !isCurrentlyActive },
    });
  };

  if (loading) return <StyledLoading>{t`Loading...`}</StyledLoading>;
  if (error) return <StyledError>{t`Error: ${error.message}`}</StyledError>;

  const modules = data?.activeAIModules ?? [];

  return (
    <StyledContainer>
      <StyledTitle>{t`AI Agents`}</StyledTitle>
      <StyledGrid>
        {modules.map(
          (agent: {
            id: string;
            moduleName: string;
            description: string;
            status: ModuleStatus;
            modelProvider: string;
            modelName: string;
            monthlyTokenUsage: number;
            monthlyCost: number;
            activatedAt: string;
          }) => (
            <StyledCard key={agent.id}>
              <StyledHeader>
                <StyledName>{agent.moduleName}</StyledName>
                <StyledDot
                  color={
                    STATUS_COLORS[agent.status] ??
                    themeCssVariables.color.gray50
                  }
                />
              </StyledHeader>
              <StyledDetail>{agent.description}</StyledDetail>
              <StyledModel>
                {agent.modelProvider} / {agent.modelName}
              </StyledModel>
              <StyledRow>
                <span>
                  {t`Tokens`}: {(agent.monthlyTokenUsage ?? 0).toLocaleString()}
                </span>
                <span>
                  {t`Cost`}: ${(agent.monthlyCost ?? 0).toFixed(2)}
                </span>
              </StyledRow>
              <StyledRow>
                <span>
                  {t`Since`}:{' '}
                  {agent.activatedAt
                    ? new Date(agent.activatedAt).toLocaleDateString()
                    : '---'}
                </span>
                <StyledToggle
                  isActive={agent.status === 'active'}
                  onClick={() => handleToggle(agent.id, agent.status)}
                >
                  {agent.status === 'active' ? t`Pause` : t`Activate`}
                </StyledToggle>
              </StyledRow>
            </StyledCard>
          ),
        )}
      </StyledGrid>
    </StyledContainer>
  );
};
