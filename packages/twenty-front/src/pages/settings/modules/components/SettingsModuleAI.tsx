import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
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

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: block;
    overflow-x: auto;
  }
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

const StyledFormRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  align-items: flex-end;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const StyledStatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${themeCssVariables.spacing[3]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: repeat(2, 1fr);
  }
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

type Agent = {
  name: string;
  model: string;
  status: 'active' | 'inactive' | 'error';
  callsToday: number;
};

type PiiRule = {
  pattern: string;
  action: string;
  enabled: boolean;
};

export const SettingsModuleAI = () => {
  const { t } = useLingui();

  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');

  const [agents, setAgents] = useState<Agent[]>([
    { name: 'Lead Scoring Agent', model: 'gpt-4o', status: 'active', callsToday: 342 },
    { name: 'Email Summarizer', model: 'claude-sonnet-4-20250514', status: 'active', callsToday: 128 },
    { name: 'Deal Predictor', model: 'gpt-4o', status: 'inactive', callsToday: 0 },
    { name: 'Customer Sentiment', model: 'gemini-pro', status: 'active', callsToday: 89 },
    { name: 'Document Classifier', model: 'claude-sonnet-4-20250514', status: 'error', callsToday: 0 },
  ]);

  const [piiRules, setPiiRules] = useState<PiiRule[]>([
    { pattern: 'Credit Card Numbers', action: 'Mask', enabled: true },
    { pattern: 'Email Addresses', action: 'Redact', enabled: true },
    { pattern: 'Phone Numbers', action: 'Mask', enabled: true },
    { pattern: 'National ID (Cedula)', action: 'Redact', enabled: true },
    { pattern: 'IP Addresses', action: 'Hash', enabled: false },
  ]);

  const handleTestConnection = () => {
    if (!apiKey) {
      return;
    }
    setConnectionStatus('connecting');
    setTimeout(() => {
      setConnectionStatus(apiKey.length > 10 ? 'connected' : 'error');
    }, 1500);
  };

  const handleToggleAgent = (index: number) => {
    setAgents((previous) =>
      previous.map((agent, agentIndex) =>
        agentIndex === index
          ? { ...agent, status: agent.status === 'active' ? 'inactive' : 'active' }
          : agent,
      ),
    );
  };

  const handleTogglePiiRule = (index: number) => {
    setPiiRules((previous) =>
      previous.map((rule, ruleIndex) =>
        ruleIndex === index ? { ...rule, enabled: !rule.enabled } : rule,
      ),
    );
  };

  const connectionLabel =
    connectionStatus === 'connected'
      ? t`Connected`
      : connectionStatus === 'connecting'
        ? t`Testing...`
        : connectionStatus === 'error'
          ? t`Invalid key`
          : t`Not configured`;

  return (
    <SubMenuTopBarContainer
      title={t`AI & Agents`}
      links={[
        { children: t`Modules`, href: getSettingsPath(SettingsPath.EnterpriseModules) },
        { children: t`AI & Agents` },
      ]}
    >
      <StyledContainer>
        <StyledTitle>{t`AI & Agents Configuration`}</StyledTitle>

        <StyledSection>
          <StyledSectionTitle>{t`API Key Configuration`}</StyledSectionTitle>
          <StyledFormGroup>
            <StyledLabel>{t`Provider`}</StyledLabel>
            <StyledSelect
              value={provider}
              onChange={(event) => setProvider(event.target.value)}
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="google">Google (Gemini)</option>
            </StyledSelect>
          </StyledFormGroup>
          <StyledFormGroup>
            <StyledLabel>{t`API Key`}</StyledLabel>
            <StyledInput
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="sk-..."
            />
          </StyledFormGroup>
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
              <StyledStatusDot status={connectionStatus === 'connected' ? 'connected' : connectionStatus === 'error' ? 'error' : 'pending'} />
              {connectionLabel}
            </span>
          </div>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Active Agents`}</StyledSectionTitle>
          <StyledTable>
            <thead>
              <tr>
                <StyledTh>{t`Agent`}</StyledTh>
                <StyledTh>{t`Model`}</StyledTh>
                <StyledTh>{t`Status`}</StyledTh>
                <StyledTh>{t`Calls Today`}</StyledTh>
                <StyledTh>{t`Actions`}</StyledTh>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent, index) => (
                <tr key={agent.name}>
                  <StyledTd>{agent.name}</StyledTd>
                  <StyledTd>{agent.model}</StyledTd>
                  <StyledTd>
                    <StyledStatusDot
                      status={
                        agent.status === 'active'
                          ? 'connected'
                          : agent.status === 'error'
                            ? 'error'
                            : 'pending'
                      }
                    />
                    {agent.status === 'active' ? t`Active` : agent.status === 'error' ? t`Error` : t`Inactive`}
                  </StyledTd>
                  <StyledTd>{agent.callsToday}</StyledTd>
                  <StyledTd>
                    <StyledButton
                      variant={agent.status === 'active' ? 'danger' : 'secondary'}
                      onClick={() => handleToggleAgent(index)}
                    >
                      {agent.status === 'active' ? t`Disable` : t`Enable`}
                    </StyledButton>
                  </StyledTd>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Usage Dashboard`}</StyledSectionTitle>
          <StyledStatGrid>
            <StyledStatCard>
              <StyledStatValue>1.2M</StyledStatValue>
              <StyledStatLabel>{t`Tokens consumed`}</StyledStatLabel>
            </StyledStatCard>
            <StyledStatCard>
              <StyledStatValue>$42</StyledStatValue>
              <StyledStatLabel>{t`Cost this month (USD)`}</StyledStatLabel>
            </StyledStatCard>
            <StyledStatCard>
              <StyledStatValue>559</StyledStatValue>
              <StyledStatLabel>{t`API calls today`}</StyledStatLabel>
            </StyledStatCard>
            <StyledStatCard>
              <StyledStatValue>99.2%</StyledStatValue>
              <StyledStatLabel>{t`Success rate`}</StyledStatLabel>
            </StyledStatCard>
          </StyledStatGrid>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`PII Masking Rules`}</StyledSectionTitle>
          <StyledTable>
            <thead>
              <tr>
                <StyledTh>{t`Pattern`}</StyledTh>
                <StyledTh>{t`Action`}</StyledTh>
                <StyledTh>{t`Enabled`}</StyledTh>
                <StyledTh>{t`Toggle`}</StyledTh>
              </tr>
            </thead>
            <tbody>
              {piiRules.map((rule, index) => (
                <tr key={rule.pattern}>
                  <StyledTd>{rule.pattern}</StyledTd>
                  <StyledTd>{rule.action}</StyledTd>
                  <StyledTd>{rule.enabled ? t`Yes` : t`No`}</StyledTd>
                  <StyledTd>
                    <StyledButton
                      variant={rule.enabled ? 'secondary' : undefined}
                      onClick={() => handleTogglePiiRule(index)}
                    >
                      {rule.enabled ? t`Disable` : t`Enable`}
                    </StyledButton>
                  </StyledTd>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Model Selection per Agent`}</StyledSectionTitle>
          {agents.map((agent) => (
            <StyledFormRow key={agent.name} style={{ marginBottom: '8px' }}>
              <StyledFormGroup style={{ flex: 1 }}>
                <StyledLabel>{agent.name}</StyledLabel>
                <StyledSelect defaultValue={agent.model}>
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4o-mini">GPT-4o Mini</option>
                  <option value="claude-sonnet-4-20250514">Claude Sonnet</option>
                  <option value="claude-haiku">Claude Haiku</option>
                  <option value="gemini-pro">Gemini Pro</option>
                </StyledSelect>
              </StyledFormGroup>
            </StyledFormRow>
          ))}
        </StyledSection>

        <StyledButton>{t`Save Settings`}</StyledButton>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
