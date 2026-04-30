import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useParams, useNavigate } from 'react-router-dom';
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

const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledModuleTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
`;

const StyledDescription = styled.p`
  font-size: 0.85rem;
  color: ${themeCssVariables.color.font.secondary};
  margin: 0;
`;

const StyledStatusBadge = styled.span<{ isActive: boolean }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${(props) => (props.isActive ? '#10b981' : '#6b7280')};
  color: white;
`;

const StyledToggleButton = styled.button<{ isActive: boolean }>`
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: ${(props) => (props.isActive ? '#ef4444' : '#10b981')};
  color: white;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.85;
  }
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

const StyledStatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
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

const StyledFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
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

  &:focus {
    outline: none;
    border-color: ${themeCssVariables.color.accent};
  }
`;

type ModuleDefinition = {
  code: string;
  name: string;
  description: string;
  category: string;
  plan: 'starter' | 'professional' | 'enterprise';
  configFields: Array<{
    key: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'toggle';
    options?: string[];
    defaultValue?: string;
  }>;
  stats: Array<{ label: string; value: string }>;
};

const MODULE_DEFINITIONS: Record<string, ModuleDefinition> = {
  gamification: {
    code: 'gamification',
    name: 'Gamification',
    description: 'Leaderboards, badges and sales challenges to drive team performance.',
    category: 'Sales',
    plan: 'professional',
    configFields: [
      { key: 'pointsPerDeal', label: 'Points per closed deal', type: 'number', defaultValue: '100' },
      { key: 'leaderboardReset', label: 'Leaderboard reset frequency', type: 'select', options: ['Weekly', 'Monthly', 'Quarterly'] },
      { key: 'badgesEnabled', label: 'Enable badges', type: 'toggle' },
    ],
    stats: [
      { label: 'Active users', value: '24' },
      { label: 'Badges earned', value: '156' },
      { label: 'Challenges active', value: '3' },
    ],
  },
  support_ticket: {
    code: 'support_ticket',
    name: 'Helpdesk & Support',
    description: 'Ticket management, SLA tracking, and CSAT surveys.',
    category: 'Service',
    plan: 'starter',
    configFields: [
      { key: 'defaultSla', label: 'Default SLA (hours)', type: 'number', defaultValue: '24' },
      { key: 'csatEnabled', label: 'Enable CSAT surveys', type: 'toggle' },
      { key: 'autoAssign', label: 'Auto-assign routing', type: 'select', options: ['Round Robin', 'Load Balanced', 'Skill Based', 'Manual'] },
    ],
    stats: [
      { label: 'Open tickets', value: '42' },
      { label: 'Avg response time', value: '2.3h' },
      { label: 'CSAT score', value: '4.6/5' },
    ],
  },
  inventory: {
    code: 'inventory',
    name: 'Inventory',
    description: 'Multi-warehouse stock management with costing methods.',
    category: 'Operations',
    plan: 'professional',
    configFields: [
      { key: 'costingMethod', label: 'Costing method', type: 'select', options: ['FIFO', 'LIFO', 'Weighted Average'] },
      { key: 'lowStockThreshold', label: 'Low stock alert threshold', type: 'number', defaultValue: '10' },
      { key: 'autoReorder', label: 'Auto-reorder enabled', type: 'toggle' },
    ],
    stats: [
      { label: 'Warehouses', value: '3' },
      { label: 'SKUs tracked', value: '1,247' },
      { label: 'Stock value', value: '$2.4M' },
    ],
  },
  asterisk: {
    code: 'asterisk',
    name: 'VoIP & Telephony',
    description: 'Click-to-call, IVR, call recording, and auto-dialer powered by Asterisk.',
    category: 'Communications',
    plan: 'professional',
    configFields: [
      { key: 'ariUrl', label: 'ARI URL', type: 'text', defaultValue: 'http://localhost:8088/ari' },
      { key: 'ariUser', label: 'ARI Username', type: 'text' },
      { key: 'ariPassword', label: 'ARI Password', type: 'text' },
      { key: 'dialPlan', label: 'Dial plan', type: 'select', options: ['Default', 'Auto-Dialer', 'Custom'] },
    ],
    stats: [
      { label: 'Extensions', value: '0' },
      { label: 'Calls today', value: '0' },
      { label: 'Avg duration', value: '--' },
    ],
  },
  marketing: {
    code: 'marketing',
    name: 'Marketing Campaigns',
    description: 'Campaign management, lead scoring, and attribution tracking.',
    category: 'Marketing',
    plan: 'professional',
    configFields: [
      { key: 'attributionModel', label: 'Attribution model', type: 'select', options: ['First Touch', 'Last Touch', 'Linear', 'W-Shaped'] },
      { key: 'scoringEnabled', label: 'Lead scoring enabled', type: 'toggle' },
    ],
    stats: [
      { label: 'Active campaigns', value: '5' },
      { label: 'Leads generated', value: '342' },
      { label: 'Conversion rate', value: '12.4%' },
    ],
  },
  accounts_receivable: {
    code: 'accounts_receivable',
    name: 'Accounts Receivable',
    description: 'Invoicing, dunning automation, and cash application.',
    category: 'Finance',
    plan: 'professional',
    configFields: [
      { key: 'dunningDays', label: 'Dunning interval (days)', type: 'number', defaultValue: '7' },
      { key: 'currency', label: 'Default currency', type: 'select', options: ['USD', 'EUR', 'COP', 'GBP', 'MXN'] },
      { key: 'autoReminders', label: 'Auto-send reminders', type: 'toggle' },
    ],
    stats: [
      { label: 'Outstanding', value: '$125K' },
      { label: 'Overdue', value: '$18K' },
      { label: 'Collection rate', value: '94%' },
    ],
  },
  project: {
    code: 'project',
    name: 'Project Management',
    description: 'Tasks, Gantt charts, time tracking, and project P&L.',
    category: 'Operations',
    plan: 'professional',
    configFields: [
      { key: 'methodology', label: 'Default methodology', type: 'select', options: ['Agile', 'Waterfall', 'Hybrid'] },
      { key: 'timeTracking', label: 'Time tracking enabled', type: 'toggle' },
      { key: 'budgetAlertPercent', label: 'Budget alert threshold (%)', type: 'number', defaultValue: '80' },
    ],
    stats: [
      { label: 'Active projects', value: '8' },
      { label: 'Tasks this week', value: '47' },
      { label: 'Team utilization', value: '78%' },
    ],
  },
  knowledge_base: {
    code: 'knowledge_base',
    name: 'Knowledge Base',
    description: 'Self-service articles, search, and AI-powered suggestions.',
    category: 'Service',
    plan: 'starter',
    configFields: [
      { key: 'publicAccess', label: 'Public access', type: 'toggle' },
      { key: 'aiSuggestions', label: 'AI suggestions enabled', type: 'toggle' },
    ],
    stats: [
      { label: 'Articles', value: '89' },
      { label: 'Views (30d)', value: '2.1K' },
      { label: 'Helpful rate', value: '87%' },
    ],
  },
};

export const SettingsModuleDetail = () => {
  const { t } = useLingui();
  const { moduleCode } = useParams<{ moduleCode: string }>();
  const navigate = useNavigate();

  const moduleDef = moduleCode ? MODULE_DEFINITIONS[moduleCode] : undefined;

  const [isActive, setIsActive] = useState(moduleDef !== undefined);
  const [configValues, setConfigValues] = useState<Record<string, string>>(() => {
    if (!moduleDef) return {};
    const initial: Record<string, string> = {};
    for (const field of moduleDef.configFields) {
      initial[field.key] = field.defaultValue ?? '';
    }
    return initial;
  });

  const handleConfigChange = (key: string, value: string) => {
    setConfigValues((prev) => ({ ...prev, [key]: value }));
  };

  if (!moduleDef) {
    return (
      <SubMenuTopBarContainer
        title={t`Module Not Found`}
        links={[
          { children: t`Modules`, href: getSettingsPath(SettingsPath.EnterpriseModules) },
          { children: moduleCode ?? t`Unknown` },
        ]}
      >
        <StyledContainer>
          <StyledDescription>
            {t`The module "${moduleCode}" is not available. Please check the module marketplace.`}
          </StyledDescription>
        </StyledContainer>
      </SubMenuTopBarContainer>
    );
  }

  return (
    <SubMenuTopBarContainer
      title={moduleDef.name}
      links={[
        { children: t`Modules`, href: getSettingsPath(SettingsPath.EnterpriseModules) },
        { children: moduleDef.name },
      ]}
    >
      <StyledContainer>
        <StyledHeader>
          <div>
            <StyledModuleTitle>{moduleDef.name}</StyledModuleTitle>
            <StyledDescription>{moduleDef.description}</StyledDescription>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <StyledStatusBadge isActive={isActive}>
              {isActive ? t`Active` : t`Inactive`}
            </StyledStatusBadge>
            <StyledToggleButton
              isActive={isActive}
              onClick={() => setIsActive((prev) => !prev)}
            >
              {isActive ? t`Deactivate` : t`Activate`}
            </StyledToggleButton>
          </div>
        </StyledHeader>

        <StyledSection>
          <StyledSectionTitle>{t`Usage Statistics`}</StyledSectionTitle>
          <StyledStatGrid>
            {moduleDef.stats.map((stat) => (
              <StyledStatCard key={stat.label}>
                <StyledStatValue>{stat.value}</StyledStatValue>
                <StyledStatLabel>{stat.label}</StyledStatLabel>
              </StyledStatCard>
            ))}
          </StyledStatGrid>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Configuration`}</StyledSectionTitle>
          {moduleDef.configFields.map((field) => (
            <StyledFormGroup key={field.key}>
              <StyledLabel>{field.label}</StyledLabel>
              {field.type === 'select' ? (
                <StyledSelect
                  value={configValues[field.key] ?? ''}
                  onChange={(event) =>
                    handleConfigChange(field.key, event.target.value)
                  }
                >
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </StyledSelect>
              ) : field.type === 'toggle' ? (
                <StyledSelect
                  value={configValues[field.key] ?? 'true'}
                  onChange={(event) =>
                    handleConfigChange(field.key, event.target.value)
                  }
                >
                  <option value="true">{t`Enabled`}</option>
                  <option value="false">{t`Disabled`}</option>
                </StyledSelect>
              ) : (
                <StyledInput
                  type={field.type}
                  value={configValues[field.key] ?? ''}
                  onChange={(event) =>
                    handleConfigChange(field.key, event.target.value)
                  }
                  placeholder={field.defaultValue}
                />
              )}
            </StyledFormGroup>
          ))}
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Module Info`}</StyledSectionTitle>
          <StyledDescription>
            {t`Category`}: {moduleDef.category} | {t`Plan`}: {moduleDef.plan}
          </StyledDescription>
        </StyledSection>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
