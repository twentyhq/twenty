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

const StyledFormRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  align-items: flex-end;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

type ProjectTemplate = {
  name: string;
  methodology: string;
  phases: number;
  estimatedWeeks: number;
};

export const SettingsModuleProjects = () => {
  const { t } = useLingui();

  const [methodology, setMethodology] = useState('agile');
  const [billableRate, setBillableRate] = useState('150000');
  const [overtimeMultiplier, setOvertimeMultiplier] = useState('1.5');

  const [templates] = useState<ProjectTemplate[]>([
    { name: 'Software Development', methodology: 'Agile', phases: 5, estimatedWeeks: 12 },
    { name: 'Infrastructure Rollout', methodology: 'Waterfall', phases: 6, estimatedWeeks: 24 },
    { name: 'Digital Transformation', methodology: 'Hybrid', phases: 4, estimatedWeeks: 16 },
  ]);

  return (
    <SubMenuTopBarContainer
      title={t`Projects`}
      links={[
        { children: t`Modules`, href: getSettingsPath(SettingsPath.EnterpriseModules) },
        { children: t`Projects` },
      ]}
    >
      <StyledContainer>
        <StyledTitle>{t`Project Management Configuration`}</StyledTitle>

        <StyledSection>
          <StyledSectionTitle>{t`Active Projects Summary`}</StyledSectionTitle>
          <StyledStatGrid>
            <StyledStatCard>
              <StyledStatValue>12</StyledStatValue>
              <StyledStatLabel>{t`Active projects`}</StyledStatLabel>
            </StyledStatCard>
            <StyledStatCard>
              <StyledStatValue>$1.2B</StyledStatValue>
              <StyledStatLabel>{t`Total budget (COP)`}</StyledStatLabel>
            </StyledStatCard>
            <StyledStatCard>
              <StyledStatValue>78%</StyledStatValue>
              <StyledStatLabel>{t`Avg health score`}</StyledStatLabel>
            </StyledStatCard>
            <StyledStatCard>
              <StyledStatValue>3</StyledStatValue>
              <StyledStatLabel>{t`At risk`}</StyledStatLabel>
            </StyledStatCard>
          </StyledStatGrid>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Project Templates`}</StyledSectionTitle>
          <StyledTable>
            <thead>
              <tr>
                <StyledTh>{t`Template Name`}</StyledTh>
                <StyledTh>{t`Methodology`}</StyledTh>
                <StyledTh>{t`Phases`}</StyledTh>
                <StyledTh>{t`Est. Weeks`}</StyledTh>
                <StyledTh>{t`Actions`}</StyledTh>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template.name}>
                  <StyledTd>{template.name}</StyledTd>
                  <StyledTd>{template.methodology}</StyledTd>
                  <StyledTd>{template.phases}</StyledTd>
                  <StyledTd>{template.estimatedWeeks}</StyledTd>
                  <StyledTd>
                    <StyledButton variant="secondary">
                      {t`Create from project`}
                    </StyledButton>
                  </StyledTd>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Default Methodology`}</StyledSectionTitle>
          <StyledFormGroup>
            <StyledLabel>{t`Project Methodology`}</StyledLabel>
            <StyledSelect
              value={methodology}
              onChange={(event) => setMethodology(event.target.value)}
            >
              <option value="waterfall">{t`Waterfall`}</option>
              <option value="agile">{t`Agile`}</option>
              <option value="hybrid">{t`Hybrid`}</option>
            </StyledSelect>
          </StyledFormGroup>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Time Tracking Settings`}</StyledSectionTitle>
          <StyledFormRow>
            <StyledFormGroup style={{ flex: 1 }}>
              <StyledLabel>{t`Billable Rate (COP/hr)`}</StyledLabel>
              <StyledInput
                type="number"
                value={billableRate}
                onChange={(event) => setBillableRate(event.target.value)}
              />
            </StyledFormGroup>
            <StyledFormGroup style={{ flex: 1 }}>
              <StyledLabel>{t`Overtime Multiplier`}</StyledLabel>
              <StyledInput
                type="number"
                step="0.1"
                value={overtimeMultiplier}
                onChange={(event) => setOvertimeMultiplier(event.target.value)}
              />
            </StyledFormGroup>
          </StyledFormRow>
          <StyledButton>{t`Save Settings`}</StyledButton>
        </StyledSection>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
