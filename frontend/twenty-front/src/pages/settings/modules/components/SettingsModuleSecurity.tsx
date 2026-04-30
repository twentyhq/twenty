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

const StyledStatusDot = styled.span<{ status: string }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  background: ${(props) =>
    props.status === 'active'
      ? '#10b981'
      : props.status === 'revoked'
        ? '#ef4444'
        : '#f59e0b'};
`;

const StyledButton = styled.button<{ variant?: string }>`
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: ${(props) =>
    props.variant === 'danger' ? '#ef4444' : '#3b82f6'};
  color: white;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.85;
  }
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

const StyledLogEntry = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid ${themeCssVariables.color.border};
  font-size: 0.85rem;
`;

type DeviceSession = {
  id: string;
  deviceName: string;
  ipAddress: string;
  status: string;
  lastActiveAt: string;
  currentLoginAt: string;
};

type AuditEntry = {
  timestamp: string;
  action: string;
  user: string;
  details: string;
};

export const SettingsModuleSecurity = () => {
  const [sessions] = useState<DeviceSession[]>([
    {
      id: '1',
      deviceName: 'Chrome on Windows',
      ipAddress: '192.168.1.100',
      status: 'active',
      lastActiveAt: new Date().toISOString(),
      currentLoginAt: new Date().toISOString(),
    },
    {
      id: '2',
      deviceName: 'Safari on Mac',
      ipAddress: '10.0.0.15',
      status: 'active',
      lastActiveAt: new Date(Date.now() - 3600000).toISOString(),
      currentLoginAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);

  const [auditLog] = useState<AuditEntry[]>([
    {
      timestamp: new Date().toISOString(),
      action: 'Login',
      user: 'admin@company.com',
      details: 'Successful login from Chrome',
    },
    {
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      action: 'Session Revoked',
      user: 'admin@company.com',
      details: 'Revoked session on Firefox',
    },
  ]);

  const twoFactorStats = {
    totalUsers: 25,
    enabledUsers: 18,
    adoptionRate: 72,
  };

  const handleRevokeSession = (sessionId: string) => {
    // Placeholder for revoke mutation
    console.log('Revoking session:', sessionId);
  };

  return (
    <SubMenuTopBarContainer
      title="Security"
      links={[{ children: 'Modules', href: '/settings/modules' }]}
    >
      <StyledContainer>
        <StyledTitle>Security Module (M10)</StyledTitle>

        {/* Device Sessions */}
        <StyledSection>
          <StyledSectionTitle>Device Sessions</StyledSectionTitle>
          <StyledTable>
            <thead>
              <tr>
                <StyledTh>Device</StyledTh>
                <StyledTh>IP Address</StyledTh>
                <StyledTh>Status</StyledTh>
                <StyledTh>Last Active</StyledTh>
                <StyledTh>Actions</StyledTh>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id}>
                  <StyledTd>{session.deviceName}</StyledTd>
                  <StyledTd>{session.ipAddress}</StyledTd>
                  <StyledTd>
                    <StyledStatusDot status={session.status} />
                    {session.status}
                  </StyledTd>
                  <StyledTd>
                    {new Date(session.lastActiveAt).toLocaleString()}
                  </StyledTd>
                  <StyledTd>
                    {session.status === 'active' && (
                      <StyledButton
                        variant="danger"
                        onClick={() => handleRevokeSession(session.id)}
                      >
                        Revoke
                      </StyledButton>
                    )}
                  </StyledTd>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </StyledSection>

        {/* Audit Log Viewer */}
        <StyledSection>
          <StyledSectionTitle>Audit Log</StyledSectionTitle>
          {auditLog.map((entry, index) => (
            <StyledLogEntry key={index}>
              <div>
                <strong>{entry.action}</strong> - {entry.user}
                <br />
                <span style={{ color: 'gray', fontSize: '0.75rem' }}>
                  {entry.details}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'gray' }}>
                {new Date(entry.timestamp).toLocaleString()}
              </div>
            </StyledLogEntry>
          ))}
        </StyledSection>

        {/* 2FA Adoption Stats */}
        <StyledSection>
          <StyledSectionTitle>2FA Adoption</StyledSectionTitle>
          <StyledStatGrid>
            <StyledStatCard>
              <StyledStatValue>{twoFactorStats.totalUsers}</StyledStatValue>
              <StyledStatLabel>Total Users</StyledStatLabel>
            </StyledStatCard>
            <StyledStatCard>
              <StyledStatValue>{twoFactorStats.enabledUsers}</StyledStatValue>
              <StyledStatLabel>2FA Enabled</StyledStatLabel>
            </StyledStatCard>
            <StyledStatCard>
              <StyledStatValue>{twoFactorStats.adoptionRate}%</StyledStatValue>
              <StyledStatLabel>Adoption Rate</StyledStatLabel>
            </StyledStatCard>
          </StyledStatGrid>
        </StyledSection>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
