import { SettingsServiceCenterFieldActionDropdown } from '@/settings/service-center/agents/components/SettingsServiceCenterFieldActionDropdown';
import { SettingsServiceCenterItemTableRow } from '@/settings/service-center/agents/components/SettingsServiceCenterItemTableRow';
import { useToggleAgentStatus } from '@/settings/service-center/agents/hooks/useToggleAgentStatus';
import { Agent } from '@/settings/service-center/agents/types/Agent';
import { SettingsPath } from '@/types/SettingsPath';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { Section } from 'twenty-ui/layout';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

type ServiceCenterTabContentProps = {
  agents: Agent[];
  refetchAgents: () => void;
};

const StyledSection = styled(Section)`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

export const ServiceCenterTabContent = ({
  agents,
  refetchAgents,
}: ServiceCenterTabContentProps) => {
  // const { t } = useTranslation();
  const navigate = useNavigate();
  const { toggleAgentStatus } = useToggleAgentStatus();

  const handleEditAgent = (agentName: string) => {
    const path = getSettingsPath(SettingsPath.ServiceCenterEditAgent).replace(
      ':agentSlug',
      agentName,
    );

    navigate(path);
  };

  return (
    <>
      {agents.length > 0 && (
        <StyledSection>
          {agents.map((agent) => (
            <SettingsServiceCenterItemTableRow
              key={agent.id}
              agent={agent}
              accessory={
                <SettingsServiceCenterFieldActionDropdown
                  modalMessage={{
                    title: agent.isActive ? 'Deactive' : 'Reactivate',
                    subtitle: agent.isActive
                      ? 'This will deactivate the agent.'
                      : 'This will reactivate the agent.',
                  }}
                  scopeKey={agent?.workspaceMember?.userEmail ?? ''}
                  onEdit={() => {
                    handleEditAgent(agent.id);
                  }}
                  onDeactivate={async () => {
                    await toggleAgentStatus(agent.id);
                    refetchAgents();
                  }}
                  isActive={agent.isActive}
                />
              }
            />
          ))}
        </StyledSection>
      )}
    </>
  );
};
