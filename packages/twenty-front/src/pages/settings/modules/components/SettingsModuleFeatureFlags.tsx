import { styled } from '@linaria/react';
import { useState } from 'react';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
`;

const StyledSection = styled.div`
  border: 1px solid ${themeCssVariables.color.border};
  border-radius: 8px;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledSectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 ${themeCssVariables.spacing[3]} 0;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: block;
    overflow-x: auto;
  }
`;

const StyledTh = styled.th`
  text-align: left;
  padding: 8px 12px;
  border-bottom: 2px solid ${themeCssVariables.color.border};
  color: ${themeCssVariables.color.font.secondary};
  font-weight: 600;
`;

const StyledTd = styled.td`
  padding: 8px 12px;
  border-bottom: 1px solid ${themeCssVariables.color.border};
`;

const StyledToggle = styled.button<{ isOn: boolean }>`
  width: 44px;
  height: 24px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  position: relative;
  background: ${(props) => (props.isOn ? '#10b981' : '#d1d5db')};
  transition: background 0.2s;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${(props) => (props.isOn ? '22px' : '2px')};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    transition: left 0.2s;
  }
`;

const StyledButton = styled.button<{ variant?: string }>`
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: ${(props) =>
    props.variant === 'secondary'
      ? themeCssVariables.color.border
      : '#3b82f6'};
  color: white;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.85;
  }
`;

const StyledActionBar = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[3]};
`;

const StyledStatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledStatCard = styled.div`
  border: 1px solid ${themeCssVariables.color.border};
  border-radius: 8px;
  padding: ${themeCssVariables.spacing[3]};
  text-align: center;
`;

const StyledStatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
`;

const StyledStatLabel = styled.div`
  font-size: 0.75rem;
  color: ${themeCssVariables.color.font.secondary};
  margin-top: 4px;
`;

type FeatureFlag = {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  adoptionPercent: number;
  workspacesEnabled: number;
  totalWorkspaces: number;
};

export const SettingsModuleFeatureFlags = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>([
    {
      key: 'IS_ENTERPRISE_ENABLED',
      name: 'Enterprise Features',
      description: 'Enable enterprise module features',
      enabled: true,
      adoptionPercent: 85,
      workspacesEnabled: 17,
      totalWorkspaces: 20,
    },
    {
      key: 'IS_COPILOT_ENABLED',
      name: 'AI Copilot',
      description: 'Enable AI copilot assistant',
      enabled: true,
      adoptionPercent: 60,
      workspacesEnabled: 12,
      totalWorkspaces: 20,
    },
    {
      key: 'IS_ADVANCED_ANALYTICS_ENABLED',
      name: 'Advanced Analytics',
      description: 'Enable advanced analytics dashboards',
      enabled: false,
      adoptionPercent: 0,
      workspacesEnabled: 0,
      totalWorkspaces: 20,
    },
    {
      key: 'IS_SANDBOX_ENABLED',
      name: 'Sandbox Environments',
      description: 'Enable workspace sandbox creation',
      enabled: true,
      adoptionPercent: 40,
      workspacesEnabled: 8,
      totalWorkspaces: 20,
    },
    {
      key: 'IS_OFFLINE_SYNC_ENABLED',
      name: 'Offline Sync',
      description: 'Enable offline data synchronization',
      enabled: false,
      adoptionPercent: 0,
      workspacesEnabled: 0,
      totalWorkspaces: 20,
    },
  ]);

  const handleToggle = (key: string) => {
    setFlags((prev) =>
      prev.map((flag) =>
        flag.key === key ? { ...flag, enabled: !flag.enabled } : flag,
      ),
    );
  };

  const handleBulkEnable = () => {
    setFlags((prev) => prev.map((flag) => ({ ...flag, enabled: true })));
  };

  const handleBulkDisable = () => {
    setFlags((prev) => prev.map((flag) => ({ ...flag, enabled: false })));
  };

  const enabledCount = flags.filter((f) => f.enabled).length;
  const averageAdoption =
    flags.length > 0
      ? Math.round(
          flags.reduce((sum, f) => sum + f.adoptionPercent, 0) / flags.length,
        )
      : 0;

  return (
    <SubMenuTopBarContainer
      title="Feature Flags"
      links={[{ children: 'Modules', href: '/settings/modules' }]}
    >
      <StyledContainer>
        <StyledTitle>Feature Flags (M26)</StyledTitle>

        {/* Adoption Metrics */}
        <StyledSection>
          <StyledSectionTitle>Adoption Metrics</StyledSectionTitle>
          <StyledStatGrid>
            <StyledStatCard>
              <StyledStatValue>{flags.length}</StyledStatValue>
              <StyledStatLabel>Total Flags</StyledStatLabel>
            </StyledStatCard>
            <StyledStatCard>
              <StyledStatValue>{enabledCount}</StyledStatValue>
              <StyledStatLabel>Enabled</StyledStatLabel>
            </StyledStatCard>
            <StyledStatCard>
              <StyledStatValue>{flags.length - enabledCount}</StyledStatValue>
              <StyledStatLabel>Disabled</StyledStatLabel>
            </StyledStatCard>
            <StyledStatCard>
              <StyledStatValue>{averageAdoption}%</StyledStatValue>
              <StyledStatLabel>Avg Adoption</StyledStatLabel>
            </StyledStatCard>
          </StyledStatGrid>
        </StyledSection>

        {/* Flag Toggle List */}
        <StyledSection>
          <StyledSectionTitle>Flag Management</StyledSectionTitle>
          <StyledActionBar>
            <StyledButton onClick={handleBulkEnable}>
              Enable All
            </StyledButton>
            <StyledButton variant="secondary" onClick={handleBulkDisable}>
              Disable All
            </StyledButton>
          </StyledActionBar>
          <StyledTable>
            <thead>
              <tr>
                <StyledTh>Flag</StyledTh>
                <StyledTh>Description</StyledTh>
                <StyledTh>Status</StyledTh>
                <StyledTh>Adoption</StyledTh>
                <StyledTh>Workspaces</StyledTh>
              </tr>
            </thead>
            <tbody>
              {flags.map((flag) => (
                <tr key={flag.key}>
                  <StyledTd>
                    <strong>{flag.name}</strong>
                    <br />
                    <span style={{ fontSize: '0.75rem', color: 'gray' }}>
                      {flag.key}
                    </span>
                  </StyledTd>
                  <StyledTd>{flag.description}</StyledTd>
                  <StyledTd>
                    <StyledToggle
                      isOn={flag.enabled}
                      onClick={() => handleToggle(flag.key)}
                    />
                  </StyledTd>
                  <StyledTd>{flag.adoptionPercent}%</StyledTd>
                  <StyledTd>
                    {flag.workspacesEnabled}/{flag.totalWorkspaces}
                  </StyledTd>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </StyledSection>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
