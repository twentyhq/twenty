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

const StyledConnectionCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px;
  border: 1px solid ${themeCssVariables.color.border};
  border-radius: 6px;
  margin-bottom: 8px;
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

type StoreConnection = {
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  productsSynced: number;
  lastSync: string;
};

type LoyaltyTier = {
  name: string;
  minPoints: number;
  discount: string;
};

export const SettingsModuleECommerce = () => {
  const { t } = useLingui();

  const [cartRecoveryDelay, setCartRecoveryDelay] = useState('60');
  const [cartRecoveryEnabled, setCartRecoveryEnabled] = useState('true');
  const [pointsPerCop, setPointsPerCop] = useState('1000');

  const [stores] = useState<StoreConnection[]>([
    { name: 'Shopify', status: 'connected', productsSynced: 1247, lastSync: '2026-04-29 09:30' },
    { name: 'MercadoLibre', status: 'connected', productsSynced: 892, lastSync: '2026-04-29 09:15' },
  ]);

  const [tiers] = useState<LoyaltyTier[]>([
    { name: 'Bronze', minPoints: 0, discount: '0%' },
    { name: 'Silver', minPoints: 5000, discount: '5%' },
    { name: 'Gold', minPoints: 15000, discount: '10%' },
    { name: 'Platinum', minPoints: 50000, discount: '15%' },
  ]);

  return (
    <SubMenuTopBarContainer
      title={t`E-Commerce`}
      links={[
        { children: t`Modules`, href: getSettingsPath(SettingsPath.EnterpriseModules) },
        { children: t`E-Commerce` },
      ]}
    >
      <StyledContainer>
        <StyledTitle>{t`E-Commerce Configuration`}</StyledTitle>

        <StyledSection>
          <StyledSectionTitle>{t`Store Connections`}</StyledSectionTitle>
          {stores.map((store) => (
            <StyledConnectionCard key={store.name}>
              <div>
                <strong>{store.name}</strong>
                <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                  <StyledStatusDot status={store.status} />
                  {store.status === 'connected' ? t`Connected` : t`Disconnected`}
                  <span style={{ marginLeft: '12px', opacity: 0.7 }}>
                    {t`Products synced`}: {store.productsSynced} | {t`Last sync`}: {store.lastSync}
                  </span>
                </div>
              </div>
              <StyledButton
                variant={store.status === 'connected' ? 'danger' : undefined}
              >
                {store.status === 'connected' ? t`Disconnect` : t`Connect`}
              </StyledButton>
            </StyledConnectionCard>
          ))}
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Product Sync Status`}</StyledSectionTitle>
          <StyledStatGrid>
            <StyledStatCard>
              <StyledStatValue>2,139</StyledStatValue>
              <StyledStatLabel>{t`Total products`}</StyledStatLabel>
            </StyledStatCard>
            <StyledStatCard>
              <StyledStatValue>2,102</StyledStatValue>
              <StyledStatLabel>{t`Synced`}</StyledStatLabel>
            </StyledStatCard>
            <StyledStatCard>
              <StyledStatValue>37</StyledStatValue>
              <StyledStatLabel>{t`Pending sync`}</StyledStatLabel>
            </StyledStatCard>
            <StyledStatCard>
              <StyledStatValue>0</StyledStatValue>
              <StyledStatLabel>{t`Sync errors`}</StyledStatLabel>
            </StyledStatCard>
          </StyledStatGrid>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Abandoned Cart Recovery`}</StyledSectionTitle>
          <StyledFormRow>
            <StyledFormGroup style={{ flex: 1 }}>
              <StyledLabel>{t`Recovery Enabled`}</StyledLabel>
              <StyledSelect
                value={cartRecoveryEnabled}
                onChange={(event) => setCartRecoveryEnabled(event.target.value)}
              >
                <option value="true">{t`Enabled`}</option>
                <option value="false">{t`Disabled`}</option>
              </StyledSelect>
            </StyledFormGroup>
            <StyledFormGroup style={{ flex: 1 }}>
              <StyledLabel>{t`Delay Before First Email (min)`}</StyledLabel>
              <StyledInput
                type="number"
                value={cartRecoveryDelay}
                onChange={(event) => setCartRecoveryDelay(event.target.value)}
              />
            </StyledFormGroup>
          </StyledFormRow>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Loyalty Program`}</StyledSectionTitle>
          <StyledFormGroup>
            <StyledLabel>{t`Points per COP spent`}</StyledLabel>
            <StyledInput
              type="number"
              value={pointsPerCop}
              onChange={(event) => setPointsPerCop(event.target.value)}
              placeholder="1000"
            />
          </StyledFormGroup>
          <StyledTable>
            <thead>
              <tr>
                <StyledTh>{t`Tier`}</StyledTh>
                <StyledTh>{t`Min Points`}</StyledTh>
                <StyledTh>{t`Discount`}</StyledTh>
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier) => (
                <tr key={tier.name}>
                  <StyledTd>{tier.name}</StyledTd>
                  <StyledTd>{tier.minPoints.toLocaleString()}</StyledTd>
                  <StyledTd>{tier.discount}</StyledTd>
                </tr>
              ))}
            </tbody>
          </StyledTable>
          <StyledButton style={{ marginTop: '12px' }}>{t`Save Settings`}</StyledButton>
        </StyledSection>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
