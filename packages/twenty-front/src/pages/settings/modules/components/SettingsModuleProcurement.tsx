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

type ApprovalThreshold = {
  level: string;
  approver: string;
  maxAmount: string;
};

type PreferredSupplier = {
  name: string;
  category: string;
  rating: number;
  contractExpiry: string;
};

type SpendCategory = {
  name: string;
  budget: string;
  spent: string;
  utilization: string;
};

export const SettingsModuleProcurement = () => {
  const { t } = useLingui();

  const [rfqAutoNotify, setRfqAutoNotify] = useState('true');
  const [rfqMinBids, setRfqMinBids] = useState('3');

  const [thresholds] = useState<ApprovalThreshold[]>([
    { level: 'Level 1', approver: 'Department Manager', maxAmount: '$10M COP' },
    { level: 'Level 2', approver: 'Procurement Director', maxAmount: '$50M COP' },
    { level: 'Level 3', approver: 'CFO', maxAmount: '$200M COP' },
    { level: 'Level 4', approver: 'Board Approval', maxAmount: 'Unlimited' },
  ]);

  const [suppliers] = useState<PreferredSupplier[]>([
    { name: 'TechSupply CO', category: 'IT Equipment', rating: 4.8, contractExpiry: '2027-03-15' },
    { name: 'OficinaTotal', category: 'Office Supplies', rating: 4.5, contractExpiry: '2026-12-31' },
    { name: 'CloudServices LATAM', category: 'Cloud & SaaS', rating: 4.7, contractExpiry: '2027-06-01' },
    { name: 'LogisticaPro', category: 'Logistics', rating: 4.3, contractExpiry: '2026-09-30' },
  ]);

  const [categories] = useState<SpendCategory[]>([
    { name: 'IT & Technology', budget: '$800M COP', spent: '$520M COP', utilization: '65%' },
    { name: 'Office Supplies', budget: '$120M COP', spent: '$85M COP', utilization: '71%' },
    { name: 'Professional Services', budget: '$450M COP', spent: '$310M COP', utilization: '69%' },
    { name: 'Marketing', budget: '$300M COP', spent: '$180M COP', utilization: '60%' },
  ]);

  return (
    <SubMenuTopBarContainer
      title={t`Procurement`}
      links={[
        { children: t`Modules`, href: getSettingsPath(SettingsPath.EnterpriseModules) },
        { children: t`Procurement` },
      ]}
    >
      <StyledContainer>
        <StyledTitle>{t`Procurement Configuration`}</StyledTitle>

        <StyledSection>
          <StyledSectionTitle>{t`Approval Workflow Thresholds`}</StyledSectionTitle>
          <StyledTable>
            <thead>
              <tr>
                <StyledTh>{t`Level`}</StyledTh>
                <StyledTh>{t`Approver`}</StyledTh>
                <StyledTh>{t`Max Amount`}</StyledTh>
              </tr>
            </thead>
            <tbody>
              {thresholds.map((threshold) => (
                <tr key={threshold.level}>
                  <StyledTd>{threshold.level}</StyledTd>
                  <StyledTd>{threshold.approver}</StyledTd>
                  <StyledTd>{threshold.maxAmount}</StyledTd>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Preferred Suppliers`}</StyledSectionTitle>
          <StyledTable>
            <thead>
              <tr>
                <StyledTh>{t`Supplier`}</StyledTh>
                <StyledTh>{t`Category`}</StyledTh>
                <StyledTh>{t`Rating`}</StyledTh>
                <StyledTh>{t`Contract Expiry`}</StyledTh>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.name}>
                  <StyledTd>{supplier.name}</StyledTd>
                  <StyledTd>{supplier.category}</StyledTd>
                  <StyledTd>{supplier.rating}/5.0</StyledTd>
                  <StyledTd>{supplier.contractExpiry}</StyledTd>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`RFQ Settings`}</StyledSectionTitle>
          <StyledFormRow>
            <StyledFormGroup style={{ flex: 1 }}>
              <StyledLabel>{t`Auto-Notify Preferred Suppliers`}</StyledLabel>
              <StyledSelect
                value={rfqAutoNotify}
                onChange={(event) => setRfqAutoNotify(event.target.value)}
              >
                <option value="true">{t`Enabled`}</option>
                <option value="false">{t`Disabled`}</option>
              </StyledSelect>
            </StyledFormGroup>
            <StyledFormGroup style={{ flex: 1 }}>
              <StyledLabel>{t`Minimum Bids Required`}</StyledLabel>
              <StyledInput
                type="number"
                value={rfqMinBids}
                onChange={(event) => setRfqMinBids(event.target.value)}
              />
            </StyledFormGroup>
          </StyledFormRow>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Spend Category Management`}</StyledSectionTitle>
          <StyledTable>
            <thead>
              <tr>
                <StyledTh>{t`Category`}</StyledTh>
                <StyledTh>{t`Budget`}</StyledTh>
                <StyledTh>{t`Spent`}</StyledTh>
                <StyledTh>{t`Utilization`}</StyledTh>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.name}>
                  <StyledTd>{category.name}</StyledTd>
                  <StyledTd>{category.budget}</StyledTd>
                  <StyledTd>{category.spent}</StyledTd>
                  <StyledTd>{category.utilization}</StyledTd>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </StyledSection>

        <StyledButton>{t`Save Settings`}</StyledButton>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
