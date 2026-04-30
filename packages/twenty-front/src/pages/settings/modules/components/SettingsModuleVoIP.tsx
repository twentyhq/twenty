import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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

const StyledFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  margin-bottom: ${themeCssVariables.spacing[3]};
`;

const StyledLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${themeCssVariables.color.font.secondary};
`;

const StyledInput = styled.input`
  padding: 8px 12px;
  border: 1px solid ${themeCssVariables.color.border};
  border-radius: 6px;
  font-size: 0.85rem;
  background: transparent;
  color: inherit;

  &:focus {
    outline: none;
    border-color: ${themeCssVariables.color.accent};
  }
`;

const StyledSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid ${themeCssVariables.color.border};
  border-radius: 6px;
  font-size: 0.85rem;
  background: transparent;
  color: inherit;
`;

const StyledButton = styled.button<{ variant?: string }>`
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: ${(props) =>
    props.variant === 'danger'
      ? '#ef4444'
      : props.variant === 'secondary'
        ? themeCssVariables.color.border
        : '#3b82f6'};
  color: white;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.85;
  }
`;

const StyledStatusDot = styled.span<{ status: string }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  background: ${(props) =>
    props.status === 'connected'
      ? '#10b981'
      : props.status === 'error'
        ? '#ef4444'
        : '#f59e0b'};
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
`;

const StyledTh = styled.th`
  text-align: left;
  padding: 8px 12px;
  border-bottom: 2px solid ${themeCssVariables.color.border};
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: ${themeCssVariables.color.font.secondary};
`;

const StyledTd = styled.td`
  padding: 8px 12px;
  border-bottom: 1px solid ${themeCssVariables.color.border};
`;

const StyledStatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledStatCard = styled.div`
  background: ${themeCssVariables.color.background};
  border: 1px solid ${themeCssVariables.color.border};
  border-radius: 6px;
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

const StyledFormRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  align-items: flex-end;
`;

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

type Extension = {
  number: string;
  name: string;
  status: 'available' | 'busy' | 'offline';
};

type CallQueue = {
  name: string;
  strategy: string;
  members: number;
  waiting: number;
};

export const SettingsModuleVoIP = () => {
  const { t } = useLingui();

  const [ariUrl, setAriUrl] = useState('http://localhost:8088/ari');
  const [ariUser, setAriUser] = useState('');
  const [ariPassword, setAriPassword] = useState('');
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('disconnected');

  const [extensions] = useState<Extension[]>([
    { number: '1001', name: 'Sales Team', status: 'available' },
    { number: '1002', name: 'Support Team', status: 'busy' },
    { number: '1003', name: 'Reception', status: 'offline' },
  ]);

  const [queues] = useState<CallQueue[]>([
    { name: 'Sales Queue', strategy: 'Round Robin', members: 5, waiting: 2 },
    {
      name: 'Support Queue',
      strategy: 'Least Recent',
      members: 8,
      waiting: 0,
    },
  ]);

  const [newExtNumber, setNewExtNumber] = useState('');
  const [newExtName, setNewExtName] = useState('');

  const handleTestConnection = () => {
    if (!ariUrl || !ariUser || !ariPassword) {
      return;
    }
    setConnectionStatus('connecting');
    // Simulate connection test
    setTimeout(() => {
      setConnectionStatus(
        ariUrl.includes('localhost') ? 'connected' : 'error',
      );
    }, 1500);
  };

  const connectionLabel =
    connectionStatus === 'connected'
      ? t`Connected`
      : connectionStatus === 'connecting'
        ? t`Connecting...`
        : connectionStatus === 'error'
          ? t`Connection failed`
          : t`Disconnected`;

  return (
    <SubMenuTopBarContainer
      title={t`VoIP & Telephony`}
      links={[
        {
          children: t`Modules`,
          href: getSettingsPath(SettingsPath.EnterpriseModules),
        },
        { children: t`VoIP & Telephony` },
      ]}
    >
      <StyledContainer>
        <StyledTitle>{t`VoIP / Asterisk Configuration`}</StyledTitle>

        <StyledSection>
          <StyledSectionTitle>{t`Server Connection`}</StyledSectionTitle>
          <StyledFormGroup>
            <StyledLabel>{t`ARI URL`}</StyledLabel>
            <StyledInput
              value={ariUrl}
              onChange={(event) => setAriUrl(event.target.value)}
              placeholder="http://pbx.example.com:8088/ari"
            />
          </StyledFormGroup>
          <StyledFormRow>
            <StyledFormGroup style={{ flex: 1 }}>
              <StyledLabel>{t`ARI Username`}</StyledLabel>
              <StyledInput
                value={ariUser}
                onChange={(event) => setAriUser(event.target.value)}
                placeholder="admin"
              />
            </StyledFormGroup>
            <StyledFormGroup style={{ flex: 1 }}>
              <StyledLabel>{t`ARI Password`}</StyledLabel>
              <StyledInput
                type="password"
                value={ariPassword}
                onChange={(event) => setAriPassword(event.target.value)}
                placeholder="********"
              />
            </StyledFormGroup>
          </StyledFormRow>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '8px',
            }}
          >
            <StyledButton onClick={handleTestConnection}>
              {t`Test Connection`}
            </StyledButton>
            <span>
              <StyledStatusDot status={connectionStatus} />
              {connectionLabel}
            </span>
          </div>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Extensions`}</StyledSectionTitle>
          <StyledTable>
            <thead>
              <tr>
                <StyledTh>{t`Extension`}</StyledTh>
                <StyledTh>{t`Name`}</StyledTh>
                <StyledTh>{t`Status`}</StyledTh>
              </tr>
            </thead>
            <tbody>
              {extensions.map((ext) => (
                <tr key={ext.number}>
                  <StyledTd>{ext.number}</StyledTd>
                  <StyledTd>{ext.name}</StyledTd>
                  <StyledTd>
                    <StyledStatusDot
                      status={
                        ext.status === 'available' ? 'connected' : 'error'
                      }
                    />
                    {ext.status}
                  </StyledTd>
                </tr>
              ))}
            </tbody>
          </StyledTable>
          <StyledFormRow style={{ marginTop: '12px' }}>
            <StyledFormGroup style={{ flex: 1 }}>
              <StyledLabel>{t`Extension number`}</StyledLabel>
              <StyledInput
                value={newExtNumber}
                onChange={(event) => setNewExtNumber(event.target.value)}
                placeholder="1004"
              />
            </StyledFormGroup>
            <StyledFormGroup style={{ flex: 1 }}>
              <StyledLabel>{t`Name`}</StyledLabel>
              <StyledInput
                value={newExtName}
                onChange={(event) => setNewExtName(event.target.value)}
                placeholder="Team name"
              />
            </StyledFormGroup>
            <StyledButton variant="secondary">{t`Add Extension`}</StyledButton>
          </StyledFormRow>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Call Queues`}</StyledSectionTitle>
          <StyledTable>
            <thead>
              <tr>
                <StyledTh>{t`Queue`}</StyledTh>
                <StyledTh>{t`Strategy`}</StyledTh>
                <StyledTh>{t`Members`}</StyledTh>
                <StyledTh>{t`Waiting`}</StyledTh>
              </tr>
            </thead>
            <tbody>
              {queues.map((queue) => (
                <tr key={queue.name}>
                  <StyledTd>{queue.name}</StyledTd>
                  <StyledTd>{queue.strategy}</StyledTd>
                  <StyledTd>{queue.members}</StyledTd>
                  <StyledTd>{queue.waiting}</StyledTd>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Active Calls Dashboard`}</StyledSectionTitle>
          <StyledStatGrid>
            <StyledStatCard>
              <StyledStatValue>0</StyledStatValue>
              <StyledStatLabel>{t`Active calls`}</StyledStatLabel>
            </StyledStatCard>
            <StyledStatCard>
              <StyledStatValue>0</StyledStatValue>
              <StyledStatLabel>{t`Calls today`}</StyledStatLabel>
            </StyledStatCard>
            <StyledStatCard>
              <StyledStatValue>--</StyledStatValue>
              <StyledStatLabel>{t`Avg duration`}</StyledStatLabel>
            </StyledStatCard>
            <StyledStatCard>
              <StyledStatValue>--</StyledStatValue>
              <StyledStatLabel>{t`Answer rate`}</StyledStatLabel>
            </StyledStatCard>
          </StyledStatGrid>
        </StyledSection>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
