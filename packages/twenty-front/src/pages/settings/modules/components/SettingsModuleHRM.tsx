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

type DeductionRow = {
  concept: string;
  employeeRate: string;
  employerRate: string;
};

type LeavePolicy = {
  type: string;
  daysPerYear: number;
  carryOver: boolean;
};

export const SettingsModuleHRM = () => {
  const { t } = useLingui();

  const [country, setCountry] = useState('CO');
  const [payrollCurrency, setPayrollCurrency] = useState('COP');

  const [deductions] = useState<DeductionRow[]>([
    { concept: 'Health (EPS)', employeeRate: '4%', employerRate: '8.5%' },
    { concept: 'Pension (AFP)', employeeRate: '4%', employerRate: '12%' },
    { concept: 'ARL', employeeRate: '0%', employerRate: '0.522%' },
    { concept: 'SENA', employeeRate: '0%', employerRate: '2%' },
    { concept: 'ICBF', employeeRate: '0%', employerRate: '3%' },
    { concept: 'Caja de Compensacion', employeeRate: '0%', employerRate: '4%' },
  ]);

  const [leavePolicies] = useState<LeavePolicy[]>([
    { type: 'Vacation', daysPerYear: 15, carryOver: true },
    { type: 'Sick Leave', daysPerYear: 180, carryOver: false },
    { type: 'Maternity', daysPerYear: 126, carryOver: false },
    { type: 'Paternity', daysPerYear: 14, carryOver: false },
  ]);

  const [reviewCycle, setReviewCycle] = useState('quarterly');

  return (
    <SubMenuTopBarContainer
      title={t`HRM & Payroll`}
      links={[
        { children: t`Modules`, href: getSettingsPath(SettingsPath.EnterpriseModules) },
        { children: t`HRM & Payroll` },
      ]}
    >
      <StyledContainer>
        <StyledTitle>{t`HRM & Payroll Configuration`}</StyledTitle>

        <StyledSection>
          <StyledSectionTitle>{t`Employee Dashboard`}</StyledSectionTitle>
          <StyledStatGrid>
            <StyledStatCard>
              <StyledStatValue>142</StyledStatValue>
              <StyledStatLabel>{t`Total employees`}</StyledStatLabel>
            </StyledStatCard>
            <StyledStatCard>
              <StyledStatValue>128</StyledStatValue>
              <StyledStatLabel>{t`Active`}</StyledStatLabel>
            </StyledStatCard>
            <StyledStatCard>
              <StyledStatValue>8</StyledStatValue>
              <StyledStatLabel>{t`On leave`}</StyledStatLabel>
            </StyledStatCard>
            <StyledStatCard>
              <StyledStatValue>6</StyledStatValue>
              <StyledStatLabel>{t`Probation`}</StyledStatLabel>
            </StyledStatCard>
          </StyledStatGrid>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Payroll Configuration`}</StyledSectionTitle>
          <StyledFormRow>
            <StyledFormGroup style={{ flex: 1 }}>
              <StyledLabel>{t`Country`}</StyledLabel>
              <StyledSelect
                value={country}
                onChange={(event) => setCountry(event.target.value)}
              >
                <option value="CO">{t`Colombia`}</option>
                <option value="MX">{t`Mexico`}</option>
                <option value="CL">{t`Chile`}</option>
                <option value="PE">{t`Peru`}</option>
              </StyledSelect>
            </StyledFormGroup>
            <StyledFormGroup style={{ flex: 1 }}>
              <StyledLabel>{t`Currency`}</StyledLabel>
              <StyledSelect
                value={payrollCurrency}
                onChange={(event) => setPayrollCurrency(event.target.value)}
              >
                <option value="COP">COP</option>
                <option value="MXN">MXN</option>
                <option value="CLP">CLP</option>
                <option value="PEN">PEN</option>
              </StyledSelect>
            </StyledFormGroup>
          </StyledFormRow>

          <StyledSectionTitle style={{ marginTop: '16px' }}>{t`Deduction Rates`}</StyledSectionTitle>
          <StyledTable>
            <thead>
              <tr>
                <StyledTh>{t`Concept`}</StyledTh>
                <StyledTh>{t`Employee Rate`}</StyledTh>
                <StyledTh>{t`Employer Rate`}</StyledTh>
              </tr>
            </thead>
            <tbody>
              {deductions.map((deduction) => (
                <tr key={deduction.concept}>
                  <StyledTd>{deduction.concept}</StyledTd>
                  <StyledTd>{deduction.employeeRate}</StyledTd>
                  <StyledTd>{deduction.employerRate}</StyledTd>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Leave Policies`}</StyledSectionTitle>
          <StyledTable>
            <thead>
              <tr>
                <StyledTh>{t`Leave Type`}</StyledTh>
                <StyledTh>{t`Days / Year`}</StyledTh>
                <StyledTh>{t`Carry Over`}</StyledTh>
              </tr>
            </thead>
            <tbody>
              {leavePolicies.map((policy) => (
                <tr key={policy.type}>
                  <StyledTd>{policy.type}</StyledTd>
                  <StyledTd>{policy.daysPerYear}</StyledTd>
                  <StyledTd>{policy.carryOver ? t`Yes` : t`No`}</StyledTd>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Performance Review Cycle`}</StyledSectionTitle>
          <StyledFormGroup>
            <StyledLabel>{t`Review Frequency`}</StyledLabel>
            <StyledSelect
              value={reviewCycle}
              onChange={(event) => setReviewCycle(event.target.value)}
            >
              <option value="monthly">{t`Monthly`}</option>
              <option value="quarterly">{t`Quarterly`}</option>
              <option value="biannual">{t`Bi-annual`}</option>
              <option value="annual">{t`Annual`}</option>
            </StyledSelect>
          </StyledFormGroup>
          <StyledButton>{t`Save Settings`}</StyledButton>
        </StyledSection>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
