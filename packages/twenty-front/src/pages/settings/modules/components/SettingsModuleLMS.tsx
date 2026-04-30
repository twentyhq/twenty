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

const StyledAlertRow = styled.div<{ severity: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: 6px;
  margin-bottom: 8px;
  background: ${(props) =>
    props.severity === 'critical'
      ? 'rgba(239, 68, 68, 0.1)'
      : props.severity === 'warning'
        ? 'rgba(245, 158, 11, 0.1)'
        : 'rgba(59, 130, 246, 0.1)'};
  border-left: 3px solid
    ${(props) =>
      props.severity === 'critical'
        ? '#ef4444'
        : props.severity === 'warning'
          ? '#f59e0b'
          : '#3b82f6'};
`;

type Course = {
  name: string;
  category: string;
  enrolled: number;
  completionRate: string;
  isCompliance: boolean;
};

type CertAlert = {
  employee: string;
  certification: string;
  expiryDate: string;
  severity: 'critical' | 'warning' | 'info';
};

export const SettingsModuleLMS = () => {
  const { t } = useLingui();

  const [complianceAutoEnroll, setComplianceAutoEnroll] = useState('true');
  const [certExpiryAlertDays, setCertExpiryAlertDays] = useState('30');

  const [courses] = useState<Course[]>([
    { name: 'Data Privacy & GDPR', category: 'Compliance', enrolled: 142, completionRate: '89%', isCompliance: true },
    { name: 'Sales Methodology', category: 'Sales', enrolled: 45, completionRate: '72%', isCompliance: false },
    { name: 'Workplace Safety', category: 'Compliance', enrolled: 142, completionRate: '95%', isCompliance: true },
    { name: 'Leadership Skills', category: 'Management', enrolled: 28, completionRate: '64%', isCompliance: false },
    { name: 'Anti-Money Laundering', category: 'Compliance', enrolled: 142, completionRate: '91%', isCompliance: true },
  ]);

  const [certAlerts] = useState<CertAlert[]>([
    { employee: 'Maria Lopez', certification: 'PMP', expiryDate: '2026-05-15', severity: 'critical' },
    { employee: 'Carlos Mendez', certification: 'AWS Solutions Architect', expiryDate: '2026-06-20', severity: 'warning' },
    { employee: 'Ana Garcia', certification: 'ISO 27001 Auditor', expiryDate: '2026-07-10', severity: 'info' },
  ]);

  return (
    <SubMenuTopBarContainer
      title={t`Learning Management`}
      links={[
        { children: t`Modules`, href: getSettingsPath(SettingsPath.EnterpriseModules) },
        { children: t`Learning Management` },
      ]}
    >
      <StyledContainer>
        <StyledTitle>{t`Learning Management Configuration`}</StyledTitle>

        <StyledSection>
          <StyledSectionTitle>{t`Course Catalog`}</StyledSectionTitle>
          <StyledTable>
            <thead>
              <tr>
                <StyledTh>{t`Course`}</StyledTh>
                <StyledTh>{t`Category`}</StyledTh>
                <StyledTh>{t`Enrolled`}</StyledTh>
                <StyledTh>{t`Completion`}</StyledTh>
                <StyledTh>{t`Compliance`}</StyledTh>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.name}>
                  <StyledTd>{course.name}</StyledTd>
                  <StyledTd>{course.category}</StyledTd>
                  <StyledTd>{course.enrolled}</StyledTd>
                  <StyledTd>{course.completionRate}</StyledTd>
                  <StyledTd>{course.isCompliance ? t`Yes` : t`No`}</StyledTd>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Compliance Course Settings`}</StyledSectionTitle>
          <StyledFormGroup>
            <StyledLabel>{t`Auto-Enroll New Employees`}</StyledLabel>
            <StyledSelect
              value={complianceAutoEnroll}
              onChange={(event) => setComplianceAutoEnroll(event.target.value)}
            >
              <option value="true">{t`Enabled`}</option>
              <option value="false">{t`Disabled`}</option>
            </StyledSelect>
          </StyledFormGroup>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Certification Expiry Alerts`}</StyledSectionTitle>
          <StyledFormGroup>
            <StyledLabel>{t`Alert Days Before Expiry`}</StyledLabel>
            <StyledInput
              type="number"
              value={certExpiryAlertDays}
              onChange={(event) => setCertExpiryAlertDays(event.target.value)}
            />
          </StyledFormGroup>
          {certAlerts.map((alert, index) => (
            <StyledAlertRow key={index} severity={alert.severity}>
              <div>
                <strong>{alert.employee}</strong> - {alert.certification}
                <br />
                <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                  {t`Expires`}: {alert.expiryDate}
                </span>
              </div>
              <StyledButton variant="secondary">{t`Notify`}</StyledButton>
            </StyledAlertRow>
          ))}
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Training ROI Summary`}</StyledSectionTitle>
          <StyledStatGrid>
            <StyledStatCard>
              <StyledStatValue>$45M</StyledStatValue>
              <StyledStatLabel>{t`Training investment (COP)`}</StyledStatLabel>
            </StyledStatCard>
            <StyledStatCard>
              <StyledStatValue>86%</StyledStatValue>
              <StyledStatLabel>{t`Avg completion rate`}</StyledStatLabel>
            </StyledStatCard>
            <StyledStatCard>
              <StyledStatValue>4.2</StyledStatValue>
              <StyledStatLabel>{t`Avg satisfaction`}</StyledStatLabel>
            </StyledStatCard>
            <StyledStatCard>
              <StyledStatValue>12%</StyledStatValue>
              <StyledStatLabel>{t`Productivity increase`}</StyledStatLabel>
            </StyledStatCard>
          </StyledStatGrid>
        </StyledSection>

        <StyledButton>{t`Save Settings`}</StyledButton>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
