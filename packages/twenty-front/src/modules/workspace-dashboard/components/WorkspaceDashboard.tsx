import styled from '@emotion/styled';
import { useState } from 'react';
import { WorkspaceSwitcher, WorkspaceRole } from './WorkspaceSwitcher';
import { AgentDashboard } from './dashboards/AgentDashboard';
import { TCDashboard } from './dashboards/TCDashboard';
import { MortgageDashboard } from './dashboards/MortgageDashboard';
import { PropertyManagementDashboard } from './dashboards/PropertyManagementDashboard';
import { MarketingDashboard } from './dashboards/MarketingDashboard';
import { OperationsDashboard } from './dashboards/OperationsDashboard';
import { FinanceDashboard } from './dashboards/FinanceDashboard';
import { LeadershipDashboard } from './dashboards/LeadershipDashboard';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${({ theme }) => theme.background.secondary};
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: ${({ theme }) => theme.background.primary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const DashboardContent = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const DASHBOARD_COMPONENTS: Record<WorkspaceRole, React.ComponentType> = {
  agent: AgentDashboard,
  'transaction-coordinator': TCDashboard,
  mortgage: MortgageDashboard,
  'property-management': PropertyManagementDashboard,
  marketing: MarketingDashboard,
  operations: OperationsDashboard,
  finance: FinanceDashboard,
  leadership: LeadershipDashboard,
};

export const WorkspaceDashboard = () => {
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceRole>('agent');

  const DashboardComponent = DASHBOARD_COMPONENTS[currentWorkspace];

  return (
    <Container>
      <TopBar>
        <Logo>AIRA</Logo>
        <WorkspaceSwitcher
          currentWorkspace={currentWorkspace}
          onWorkspaceChange={setCurrentWorkspace}
        />
      </TopBar>
      <DashboardContent>
        <DashboardComponent />
      </DashboardContent>
    </Container>
  );
};
