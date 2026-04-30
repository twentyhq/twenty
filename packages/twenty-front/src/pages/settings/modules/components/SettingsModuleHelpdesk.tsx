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

const StyledFormRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  align-items: flex-end;
`;

const StyledPriorityBadge = styled.span<{ priority: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
  background: ${(props) =>
    props.priority === 'critical'
      ? '#ef4444'
      : props.priority === 'high'
        ? '#f59e0b'
        : props.priority === 'medium'
          ? '#3b82f6'
          : '#6b7280'};
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

type SlaPolicy = {
  id: string;
  name: string;
  priority: string;
  responseTimeHours: number;
  resolutionTimeHours: number;
  businessHoursOnly: boolean;
};

type RoutingRule = {
  id: string;
  condition: string;
  action: string;
  target: string;
};

export const SettingsModuleHelpdesk = () => {
  const { t } = useLingui();

  const [csatEnabled, setCsatEnabled] = useState('true');
  const [csatDelay, setCsatDelay] = useState('24');
  const [csatScale, setCsatScale] = useState('5');

  const [slaPolicies] = useState<SlaPolicy[]>([
    { id: '1', name: 'Critical SLA', priority: 'critical', responseTimeHours: 1, resolutionTimeHours: 4, businessHoursOnly: false },
    { id: '2', name: 'High Priority', priority: 'high', responseTimeHours: 4, resolutionTimeHours: 24, businessHoursOnly: true },
    { id: '3', name: 'Standard', priority: 'medium', responseTimeHours: 8, resolutionTimeHours: 48, businessHoursOnly: true },
    { id: '4', name: 'Low Priority', priority: 'low', responseTimeHours: 24, resolutionTimeHours: 120, businessHoursOnly: true },
  ]);

  const [routingRules] = useState<RoutingRule[]>([
    { id: '1', condition: 'Subject contains "billing"', action: 'Assign to', target: 'Finance Team' },
    { id: '2', condition: 'Customer tier = Enterprise', action: 'Set priority', target: 'High' },
    { id: '3', condition: 'Language = Spanish', action: 'Assign to', target: 'LATAM Support' },
  ]);

  return (
    <SubMenuTopBarContainer
      title={t`Helpdesk & Support`}
      links={[
        { children: t`Modules`, href: getSettingsPath(SettingsPath.EnterpriseModules) },
        { children: t`Helpdesk` },
      ]}
    >
      <StyledContainer>
        <StyledTitle>{t`Helpdesk Configuration`}</StyledTitle>

        <StyledStatGrid>
          <StyledStatCard>
            <StyledStatValue>42</StyledStatValue>
            <StyledStatLabel>{t`Open tickets`}</StyledStatLabel>
          </StyledStatCard>
          <StyledStatCard>
            <StyledStatValue>2.3h</StyledStatValue>
            <StyledStatLabel>{t`Avg response time`}</StyledStatLabel>
          </StyledStatCard>
          <StyledStatCard>
            <StyledStatValue>94%</StyledStatValue>
            <StyledStatLabel>{t`SLA compliance`}</StyledStatLabel>
          </StyledStatCard>
          <StyledStatCard>
            <StyledStatValue>4.6</StyledStatValue>
            <StyledStatLabel>{t`CSAT score`}</StyledStatLabel>
          </StyledStatCard>
        </StyledStatGrid>

        <StyledSection>
          <StyledSectionTitle>{t`SLA Policies`}</StyledSectionTitle>
          <StyledTable>
            <thead>
              <tr>
                <StyledTh>{t`Policy Name`}</StyledTh>
                <StyledTh>{t`Priority`}</StyledTh>
                <StyledTh>{t`Response Time`}</StyledTh>
                <StyledTh>{t`Resolution Time`}</StyledTh>
                <StyledTh>{t`Business Hours`}</StyledTh>
              </tr>
            </thead>
            <tbody>
              {slaPolicies.map((policy) => (
                <tr key={policy.id}>
                  <StyledTd>{policy.name}</StyledTd>
                  <StyledTd>
                    <StyledPriorityBadge priority={policy.priority}>
                      {policy.priority}
                    </StyledPriorityBadge>
                  </StyledTd>
                  <StyledTd>{policy.responseTimeHours}h</StyledTd>
                  <StyledTd>{policy.resolutionTimeHours}h</StyledTd>
                  <StyledTd>
                    {policy.businessHoursOnly ? t`Yes` : t`24/7`}
                  </StyledTd>
                </tr>
              ))}
            </tbody>
          </StyledTable>
          <div style={{ marginTop: '12px' }}>
            <StyledButton variant="secondary">{t`Add SLA Policy`}</StyledButton>
          </div>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Routing Rules`}</StyledSectionTitle>
          <StyledTable>
            <thead>
              <tr>
                <StyledTh>{t`Condition`}</StyledTh>
                <StyledTh>{t`Action`}</StyledTh>
                <StyledTh>{t`Target`}</StyledTh>
              </tr>
            </thead>
            <tbody>
              {routingRules.map((rule) => (
                <tr key={rule.id}>
                  <StyledTd>{rule.condition}</StyledTd>
                  <StyledTd>{rule.action}</StyledTd>
                  <StyledTd>{rule.target}</StyledTd>
                </tr>
              ))}
            </tbody>
          </StyledTable>
          <div style={{ marginTop: '12px' }}>
            <StyledButton variant="secondary">{t`Add Routing Rule`}</StyledButton>
          </div>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`CSAT Settings`}</StyledSectionTitle>
          <StyledFormGroup>
            <StyledLabel>{t`CSAT Surveys`}</StyledLabel>
            <StyledSelect
              value={csatEnabled}
              onChange={(event) => setCsatEnabled(event.target.value)}
            >
              <option value="true">{t`Enabled`}</option>
              <option value="false">{t`Disabled`}</option>
            </StyledSelect>
          </StyledFormGroup>
          <StyledFormRow>
            <StyledFormGroup style={{ flex: 1 }}>
              <StyledLabel>{t`Send survey after (hours)`}</StyledLabel>
              <StyledInput
                type="number"
                value={csatDelay}
                onChange={(event) => setCsatDelay(event.target.value)}
              />
            </StyledFormGroup>
            <StyledFormGroup style={{ flex: 1 }}>
              <StyledLabel>{t`Rating scale`}</StyledLabel>
              <StyledSelect
                value={csatScale}
                onChange={(event) => setCsatScale(event.target.value)}
              >
                <option value="5">{t`1-5 Stars`}</option>
                <option value="10">{t`1-10 (NPS)`}</option>
                <option value="3">{t`Thumbs (Good/Neutral/Bad)`}</option>
              </StyledSelect>
            </StyledFormGroup>
          </StyledFormRow>
          <StyledButton>{t`Save CSAT Settings`}</StyledButton>
        </StyledSection>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
