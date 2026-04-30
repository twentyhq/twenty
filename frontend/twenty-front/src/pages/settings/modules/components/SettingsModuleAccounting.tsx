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

const StyledConnectionCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px;
  border: 1px solid ${themeCssVariables.color.border};
  border-radius: 6px;
  margin-bottom: 8px;
`;

type Provider = {
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
};

type AccountEntry = {
  code: string;
  name: string;
  type: string;
  balance: string;
};

type TaxRule = {
  name: string;
  rate: string;
  applies: string;
  enabled: boolean;
};

export const SettingsModuleAccounting = () => {
  const { t } = useLingui();

  const [providers] = useState<Provider[]>([
    { name: 'Siigo', status: 'connected', lastSync: '2026-04-29 08:15' },
    { name: 'Alegra', status: 'disconnected', lastSync: '--' },
    { name: 'QuickBooks', status: 'disconnected', lastSync: '--' },
  ]);

  const [accounts] = useState<AccountEntry[]>([
    { code: '1105', name: 'Caja General', type: 'Asset', balance: '$12,500,000' },
    { code: '1305', name: 'Clientes Nacionales', type: 'Asset', balance: '$45,200,000' },
    { code: '2205', name: 'Proveedores Nacionales', type: 'Liability', balance: '$18,300,000' },
    { code: '4135', name: 'Comercio al por mayor', type: 'Revenue', balance: '$98,700,000' },
  ]);

  const [taxRules, setTaxRules] = useState<TaxRule[]>([
    { name: 'IVA', rate: '19%', applies: 'Sales & Purchases', enabled: true },
    { name: 'ReteFuente', rate: '2.5%', applies: 'Purchases > $1,070,000', enabled: true },
    { name: 'ICA', rate: '0.966%', applies: 'Services in Bogota', enabled: false },
  ]);

  const handleToggleTax = (index: number) => {
    setTaxRules((previous) =>
      previous.map((rule, ruleIndex) =>
        ruleIndex === index ? { ...rule, enabled: !rule.enabled } : rule,
      ),
    );
  };

  return (
    <SubMenuTopBarContainer
      title={t`Accounting`}
      links={[
        { children: t`Modules`, href: getSettingsPath(SettingsPath.EnterpriseModules) },
        { children: t`Accounting` },
      ]}
    >
      <StyledContainer>
        <StyledTitle>{t`Accounting Integration`}</StyledTitle>

        <StyledSection>
          <StyledSectionTitle>{t`Provider Connections`}</StyledSectionTitle>
          {providers.map((provider) => (
            <StyledConnectionCard key={provider.name}>
              <div>
                <strong>{provider.name}</strong>
                <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                  <StyledStatusDot status={provider.status} />
                  {provider.status === 'connected' ? t`Connected` : t`Disconnected`}
                  {provider.lastSync !== '--' && (
                    <span style={{ marginLeft: '12px', opacity: 0.7 }}>
                      {t`Last sync`}: {provider.lastSync}
                    </span>
                  )}
                </div>
              </div>
              <StyledButton
                variant={provider.status === 'connected' ? 'danger' : undefined}
              >
                {provider.status === 'connected' ? t`Disconnect` : t`Connect`}
              </StyledButton>
            </StyledConnectionCard>
          ))}
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Chart of Accounts`}</StyledSectionTitle>
          <StyledTable>
            <thead>
              <tr>
                <StyledTh>{t`Code`}</StyledTh>
                <StyledTh>{t`Account Name`}</StyledTh>
                <StyledTh>{t`Type`}</StyledTh>
                <StyledTh>{t`Balance`}</StyledTh>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.code}>
                  <StyledTd>{account.code}</StyledTd>
                  <StyledTd>{account.name}</StyledTd>
                  <StyledTd>{account.type}</StyledTd>
                  <StyledTd>{account.balance}</StyledTd>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Tax Rules`}</StyledSectionTitle>
          <StyledTable>
            <thead>
              <tr>
                <StyledTh>{t`Tax`}</StyledTh>
                <StyledTh>{t`Rate`}</StyledTh>
                <StyledTh>{t`Applies To`}</StyledTh>
                <StyledTh>{t`Enabled`}</StyledTh>
              </tr>
            </thead>
            <tbody>
              {taxRules.map((rule, index) => (
                <tr key={rule.name}>
                  <StyledTd>{rule.name}</StyledTd>
                  <StyledTd>{rule.rate}</StyledTd>
                  <StyledTd>{rule.applies}</StyledTd>
                  <StyledTd>
                    <StyledButton
                      variant={rule.enabled ? undefined : 'secondary'}
                      onClick={() => handleToggleTax(index)}
                    >
                      {rule.enabled ? t`Enabled` : t`Disabled`}
                    </StyledButton>
                  </StyledTd>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Sync Status`}</StyledSectionTitle>
          <StyledStatGrid>
            <StyledStatCard>
              <StyledStatValue>1</StyledStatValue>
              <StyledStatLabel>{t`Active connections`}</StyledStatLabel>
            </StyledStatCard>
            <StyledStatCard>
              <StyledStatValue>247</StyledStatValue>
              <StyledStatLabel>{t`Entries synced`}</StyledStatLabel>
            </StyledStatCard>
            <StyledStatCard>
              <StyledStatValue>0</StyledStatValue>
              <StyledStatLabel>{t`Sync errors`}</StyledStatLabel>
            </StyledStatCard>
            <StyledStatCard>
              <StyledStatValue>08:15</StyledStatValue>
              <StyledStatLabel>{t`Last sync`}</StyledStatLabel>
            </StyledStatCard>
          </StyledStatGrid>
        </StyledSection>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
