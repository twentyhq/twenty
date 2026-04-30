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

type ContractTemplate = {
  name: string;
  category: string;
  version: string;
  lastUpdated: string;
};

type ApprovalStep = {
  order: number;
  role: string;
  threshold: string;
};

export const SettingsModuleCLM = () => {
  const { t } = useLingui();

  const [renewalAlert90, setRenewalAlert90] = useState(true);
  const [renewalAlert60, setRenewalAlert60] = useState(true);
  const [renewalAlert30, setRenewalAlert30] = useState(true);
  const [riskLow, setRiskLow] = useState('30');
  const [riskMedium, setRiskMedium] = useState('60');
  const [riskHigh, setRiskHigh] = useState('80');

  const [templates] = useState<ContractTemplate[]>([
    { name: 'Master Service Agreement', category: 'Services', version: 'v3.2', lastUpdated: '2026-03-15' },
    { name: 'SaaS Subscription', category: 'Software', version: 'v2.1', lastUpdated: '2026-04-01' },
    { name: 'NDA - Mutual', category: 'Confidentiality', version: 'v1.5', lastUpdated: '2026-02-20' },
    { name: 'Statement of Work', category: 'Services', version: 'v4.0', lastUpdated: '2026-04-10' },
  ]);

  const [approvalChain] = useState<ApprovalStep[]>([
    { order: 1, role: 'Account Manager', threshold: '< $50M COP' },
    { order: 2, role: 'Sales Director', threshold: '$50M - $200M COP' },
    { order: 3, role: 'VP Sales', threshold: '$200M - $500M COP' },
    { order: 4, role: 'CEO', threshold: '> $500M COP' },
  ]);

  return (
    <SubMenuTopBarContainer
      title={t`Contract Lifecycle`}
      links={[
        { children: t`Modules`, href: getSettingsPath(SettingsPath.EnterpriseModules) },
        { children: t`Contract Lifecycle` },
      ]}
    >
      <StyledContainer>
        <StyledTitle>{t`Contract Lifecycle Management`}</StyledTitle>

        <StyledSection>
          <StyledSectionTitle>{t`Template Library`}</StyledSectionTitle>
          <StyledTable>
            <thead>
              <tr>
                <StyledTh>{t`Template`}</StyledTh>
                <StyledTh>{t`Category`}</StyledTh>
                <StyledTh>{t`Version`}</StyledTh>
                <StyledTh>{t`Last Updated`}</StyledTh>
                <StyledTh>{t`Actions`}</StyledTh>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template.name}>
                  <StyledTd>{template.name}</StyledTd>
                  <StyledTd>{template.category}</StyledTd>
                  <StyledTd>{template.version}</StyledTd>
                  <StyledTd>{template.lastUpdated}</StyledTd>
                  <StyledTd>
                    <StyledButton variant="secondary">{t`Edit`}</StyledButton>
                  </StyledTd>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Approval Chain`}</StyledSectionTitle>
          <StyledTable>
            <thead>
              <tr>
                <StyledTh>{t`Order`}</StyledTh>
                <StyledTh>{t`Role`}</StyledTh>
                <StyledTh>{t`Threshold`}</StyledTh>
              </tr>
            </thead>
            <tbody>
              {approvalChain.map((step) => (
                <tr key={step.order}>
                  <StyledTd>{step.order}</StyledTd>
                  <StyledTd>{step.role}</StyledTd>
                  <StyledTd>{step.threshold}</StyledTd>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Renewal Alert Settings`}</StyledSectionTitle>
          <StyledFormRow>
            <StyledFormGroup style={{ flex: 1 }}>
              <StyledLabel>{t`90-day alert`}</StyledLabel>
              <StyledSelect
                value={renewalAlert90 ? 'true' : 'false'}
                onChange={(event) => setRenewalAlert90(event.target.value === 'true')}
              >
                <option value="true">{t`Enabled`}</option>
                <option value="false">{t`Disabled`}</option>
              </StyledSelect>
            </StyledFormGroup>
            <StyledFormGroup style={{ flex: 1 }}>
              <StyledLabel>{t`60-day alert`}</StyledLabel>
              <StyledSelect
                value={renewalAlert60 ? 'true' : 'false'}
                onChange={(event) => setRenewalAlert60(event.target.value === 'true')}
              >
                <option value="true">{t`Enabled`}</option>
                <option value="false">{t`Disabled`}</option>
              </StyledSelect>
            </StyledFormGroup>
            <StyledFormGroup style={{ flex: 1 }}>
              <StyledLabel>{t`30-day alert`}</StyledLabel>
              <StyledSelect
                value={renewalAlert30 ? 'true' : 'false'}
                onChange={(event) => setRenewalAlert30(event.target.value === 'true')}
              >
                <option value="true">{t`Enabled`}</option>
                <option value="false">{t`Disabled`}</option>
              </StyledSelect>
            </StyledFormGroup>
          </StyledFormRow>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Risk Scoring Thresholds`}</StyledSectionTitle>
          <StyledFormRow>
            <StyledFormGroup style={{ flex: 1 }}>
              <StyledLabel>{t`Low Risk (0 to)`}</StyledLabel>
              <StyledInput
                type="number"
                value={riskLow}
                onChange={(event) => setRiskLow(event.target.value)}
              />
            </StyledFormGroup>
            <StyledFormGroup style={{ flex: 1 }}>
              <StyledLabel>{t`Medium Risk (to)`}</StyledLabel>
              <StyledInput
                type="number"
                value={riskMedium}
                onChange={(event) => setRiskMedium(event.target.value)}
              />
            </StyledFormGroup>
            <StyledFormGroup style={{ flex: 1 }}>
              <StyledLabel>{t`High Risk (to 100)`}</StyledLabel>
              <StyledInput
                type="number"
                value={riskHigh}
                onChange={(event) => setRiskHigh(event.target.value)}
              />
            </StyledFormGroup>
          </StyledFormRow>
          <StyledButton>{t`Save Settings`}</StyledButton>
        </StyledSection>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
